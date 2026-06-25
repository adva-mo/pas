import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/telegram/bot', () => ({
  getBot: vi.fn(),
}))

import { POST } from '../webhook/route'
import { getBot } from '@/lib/telegram/bot'

const SECRET = 'test-webhook-secret'

function makeRequest(body: object, secretOverride?: string) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (secretOverride !== undefined) {
    headers['x-telegram-bot-api-secret-token'] = secretOverride
  }
  return new NextRequest('http://localhost/api/telegram/webhook', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/telegram/webhook', () => {
  let handleUpdate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET
    handleUpdate = vi.fn().mockResolvedValue(undefined)
    vi.mocked(getBot).mockReturnValue({ handleUpdate } as any)
  })

  it('returns 401 when secret header is missing', async () => {
    const req = makeRequest({ update_id: 1 })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('returns 401 when secret is wrong', async () => {
    const req = makeRequest({ update_id: 1 }, 'wrong-secret')
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(handleUpdate).not.toHaveBeenCalled()
  })

  it('returns 200 and calls handleUpdate with the parsed body', async () => {
    const body = {
      update_id: 42,
      message: { message_id: 1, text: '/start', from: { id: 123 }, chat: { id: 123 }, date: 0 },
    }
    const req = makeRequest(body, SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(handleUpdate).toHaveBeenCalledWith(body)
  })
})
