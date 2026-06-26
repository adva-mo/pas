import { NextRequest, NextResponse } from 'next/server'
import { getBot } from '@/lib/telegram/bot'

const HANDLER_TIMEOUT_MS = 8000

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const bot = getBot()

  try {
    await Promise.race([
      bot.handleUpdate(body),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('handler timeout')), HANDLER_TIMEOUT_MS)
      ),
    ])
  } catch (err) {
    console.error('Webhook handler error:', err)
    const chatId =
      body?.message?.chat?.id ??
      body?.callback_query?.message?.chat?.id
    if (chatId) {
      try {
        await bot.telegram.sendMessage(chatId, 'משהו השתבש. נסה שוב עם /start.')
      } catch {}
    }
  }

  // Always 200 — Telegram must not retry the same update
  return NextResponse.json({ ok: true })
}
