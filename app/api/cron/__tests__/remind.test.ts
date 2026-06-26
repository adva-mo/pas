import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/telegram/bot', () => ({
  getBot: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServiceClient: vi.fn(),
}))

import { GET } from '../remind/route'
import { getBot } from '@/lib/telegram/bot'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

const SECRET = 'test-cron-secret'

function makeRequest(authHeader?: string) {
  const headers: Record<string, string> = {}
  if (authHeader !== undefined) headers['authorization'] = authHeader
  return new NextRequest('http://localhost/api/cron/remind', { headers })
}

function makeDb(employees: object[], submitted: object[]) {
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'employees') {
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: employees, error: null }) }
    }
    if (table === 'daily_reports') {
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: submitted, error: null }) }
    }
    return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) }
  })
  return { from }
}

describe('GET /api/cron/remind', () => {
  let sendMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    process.env.CRON_SECRET = SECRET
    sendMessage = vi.fn().mockResolvedValue(undefined)
    vi.mocked(getBot).mockReturnValue({ telegram: { sendMessage } } as any)
  })

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    const res = await GET(makeRequest('Bearer wrong-secret'))
    expect(res.status).toBe(401)
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('returns { sent: 0 } when all employees already reported', async () => {
    vi.mocked(createSupabaseServiceClient).mockReturnValue(
      makeDb(
        [{ id: 'emp-1', name: 'דני', telegram_user_id: 111 }],
        [{ employee_id: 'emp-1' }],
      ) as any
    )

    const res = await GET(makeRequest(`Bearer ${SECRET}`))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sent: 0 })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('sends a reminder to each employee who has not reported', async () => {
    vi.mocked(createSupabaseServiceClient).mockReturnValue(
      makeDb(
        [
          { id: 'emp-1', name: 'דני', telegram_user_id: 111 },
          { id: 'emp-2', name: 'רחל', telegram_user_id: 222 },
        ],
        [{ employee_id: 'emp-1' }], // emp-1 reported, emp-2 did not
      ) as any
    )

    const res = await GET(makeRequest(`Bearer ${SECRET}`))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sent: 1 })
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(sendMessage).toHaveBeenCalledWith(222, expect.stringContaining('רחל'))
  })

  it('sends reminders to all employees when none have reported', async () => {
    vi.mocked(createSupabaseServiceClient).mockReturnValue(
      makeDb(
        [
          { id: 'emp-1', name: 'דני', telegram_user_id: 111 },
          { id: 'emp-2', name: 'רחל', telegram_user_id: 222 },
        ],
        [],
      ) as any
    )

    const res = await GET(makeRequest(`Bearer ${SECRET}`))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ sent: 2 })
    expect(sendMessage).toHaveBeenCalledTimes(2)
    expect(sendMessage).toHaveBeenCalledWith(111, expect.stringContaining('דני'))
    expect(sendMessage).toHaveBeenCalledWith(222, expect.stringContaining('רחל'))
  })
})
