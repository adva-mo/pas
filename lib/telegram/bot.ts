import { Telegraf } from 'telegraf'
import { registerHandlers } from './handlers'

let bot: Telegraf | null = null

export function getBot(): Telegraf {
  if (!bot) {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)
    registerHandlers(bot)
  }
  return bot
}
