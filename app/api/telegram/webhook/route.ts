import { after } from 'next/server'
import { NextRequest, NextResponse } from 'next/server'
import { getBot } from '@/lib/telegram/bot'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const bot = getBot()

  const chatId = body?.message?.chat?.id ?? body?.callback_query?.message?.chat?.id

  after(async () => {
    try {
      await Promise.race([
        bot.handleUpdate(body),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('handler timeout')), 8000)
        ),
      ])
    } catch (err) {
      console.error('Webhook handler error:', err)
      if (chatId) {
        try { await bot.telegram.sendMessage(chatId, 'משהו השתבש. נסה שוב עם /start.') } catch {}
      }
    }
  })

  return NextResponse.json({ ok: true })
}
