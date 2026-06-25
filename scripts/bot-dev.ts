import { config } from 'node:process'
import { Telegraf } from 'telegraf'
import { registerHandlers } from '../lib/telegram/handlers'

// Load .env.local
import { readFileSync } from 'node:fs'
try {
  const env = readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch {}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)
registerHandlers(bot)

bot.launch({ dropPendingUpdates: true })
console.log('Bot running in polling mode')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
