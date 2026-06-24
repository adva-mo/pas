import { NextRequest, NextResponse } from 'next/server'
import { getBot } from '@/lib/telegram/bot'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const bot = getBot()

  await bot.handleUpdate(body)
  return NextResponse.json({ ok: true })
}
