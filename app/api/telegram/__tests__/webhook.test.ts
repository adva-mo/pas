import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

let afterCallback: (() => Promise<void>) | undefined

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return {
    ...actual,
    after: (fn: () => Promise<void>) => { afterCallback = fn },
  }
})

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
  let sendMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    afterCallback = undefined
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET
    handleUpdate = vi.fn().mockResolvedValue(undefined)
    sendMessage = vi.fn().mockResolvedValue(undefined)
    vi.mocked(getBot).mockReturnValue({
      handleUpdate,
      telegram: { sendMessage },
    } as any)
    vi.spyOn(console, 'error').mockImplementation(() => {})
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

  it('returns 200 immediately and calls handleUpdate after', async () => {
    const body = {
      update_id: 42,
      message: { message_id: 1, text: '/start', from: { id: 123 }, chat: { id: 123 }, date: 0 },
    }
    const req = makeRequest(body, SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    // handleUpdate runs after the response — flush the after() callback
    await afterCallback?.()
    expect(handleUpdate).toHaveBeenCalledWith(body)
  })

  it('notifies user when handler throws, and still returns 200', async () => {
    handleUpdate.mockRejectedValue(new Error('supabase connection error'))
    const body = {
      update_id: 43,
      message: { chat: { id: 999 }, from: { id: 999 }, text: 'hi', date: 0 },
    }
    const req = makeRequest(body, SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    await afterCallback?.()
    expect(sendMessage).toHaveBeenCalledWith(999, 'משהו השתבש. נסה שוב עם /start.')
  })

  it('returns 200 immediately when handler hangs, then notifies user after timeout', async () => {
    vi.useFakeTimers()
    handleUpdate.mockImplementation(() => new Promise(() => {})) // never resolves
    const body = {
      update_id: 44,
      message: { chat: { id: 888 }, from: { id: 888 }, text: 'hi', date: 0 },
    }
    const req = makeRequest(body, SECRET)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const afterPromise = afterCallback?.()
    await vi.runAllTimersAsync()
    await afterPromise
    expect(sendMessage).toHaveBeenCalledWith(888, 'משהו השתבש. נסה שוב עם /start.')
    vi.useRealTimers()
  })
})
