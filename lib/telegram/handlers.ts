import { Context, Telegraf, Markup } from 'telegraf'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

type BotContext = Context

function buildProjectKeyboard(projects: { id: string; name: string }[]) {
  const buttons = projects.map(p => Markup.button.callback(p.name, `project:${p.id}:${p.name}`))
  // 2 columns
  const rows: ReturnType<typeof Markup.button.callback>[][] = []
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2))
  }
  return Markup.inlineKeyboard(rows)
}

async function askProject(ctx: BotContext) {
  const db = createSupabaseServiceClient()
  const { data: projects } = await db
    .from('projects')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')
    .order('name')

  if (!projects || projects.length === 0) {
    await ctx.reply('No projects are configured yet. Contact your manager.')
    return
  }

  await ctx.reply('Where did you work today?', buildProjectKeyboard(projects))
}

export function registerHandlers(bot: Telegraf) {
  // /start — always reset and begin
  bot.start(async (ctx) => {
    const telegramUserId = ctx.from.id
    const db = createSupabaseServiceClient()

    const { data: employee, error: empError } = await db
      .from('employees')
      .select('id, name')
      .eq('telegram_user_id', telegramUserId)
      .eq('is_active', true)
      .maybeSingle()

    if (empError) {
      await ctx.reply(`DB error: ${empError.message}`)
      return
    }

    if (!employee) {
      await ctx.reply(`Not found. Your Telegram ID: ${telegramUserId}`)
      return
    }

    // Clear any existing session
    await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)

    await ctx.reply(`Hi ${employee.name}! Let's submit your daily report.`)
    await askProject(ctx)
  })

  // Project button tap
  bot.action(/^project:(.+):(.+)$/, async (ctx) => {
    const telegramUserId = ctx.from!.id
    const projectId = ctx.match[1]
    const projectName = ctx.match[2]
    const db = createSupabaseServiceClient()

    const { data: employee } = await db
      .from('employees')
      .select('id')
      .eq('telegram_user_id', telegramUserId)
      .eq('is_active', true)
      .maybeSingle()

    if (!employee) {
      await ctx.answerCbQuery()
      await ctx.reply('You are not registered. Contact your manager.')
      return
    }

    // Check if already submitted today
    const today = new Date().toISOString().slice(0, 10)
    const { data: existing } = await db
      .from('daily_reports')
      .select('id')
      .eq('employee_id', employee.id)
      .eq('work_date', today)
      .maybeSingle()

    if (existing) {
      await ctx.answerCbQuery()
      await ctx.reply('You already submitted today\'s report.')
      return
    }

    await db.from('bot_sessions').upsert({
      telegram_user_id: telegramUserId,
      step: 'work',
      project_id: projectId,
      project_name: projectName,
      updated_at: new Date().toISOString(),
    })

    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply(`Project: ${projectName}\n\nWhat did you do today?`)
  })

  // Confirm button
  bot.action('confirm', async (ctx) => {
    const telegramUserId = ctx.from!.id
    const db = createSupabaseServiceClient()

    const { data: session } = await db
      .from('bot_sessions')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    if (!session || session.step !== 'confirm') {
      await ctx.answerCbQuery()
      return
    }

    const { data: employee } = await db
      .from('employees')
      .select('id')
      .eq('telegram_user_id', telegramUserId)
      .eq('is_active', true)
      .maybeSingle()

    if (!employee) {
      await ctx.answerCbQuery()
      await ctx.reply('You are not registered. Contact your manager.')
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    const { error } = await db.from('daily_reports').insert({
      employee_id: employee.id,
      project_id: session.project_id,
      location: session.project_name!,
      work_date: today,
      work_description: session.work_description!,
      notes: session.notes ?? null,
    })

    if (error) {
      await ctx.answerCbQuery()
      if (error.code === '23505') {
        await ctx.reply('You already submitted today\'s report.')
      } else {
        await ctx.reply('Something went wrong. Please try again with /start.')
      }
      await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
      return
    }

    await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('Report saved. ✓\n\nHave a great rest of your day!')
  })

  // Start over button
  bot.action('start_over', async (ctx) => {
    const telegramUserId = ctx.from!.id
    const db = createSupabaseServiceClient()
    await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('Starting over.')
    await askProject(ctx)
  })

  // Free text messages
  bot.on('text', async (ctx) => {
    const telegramUserId = ctx.from.id
    const text = ctx.message.text.trim()
    const db = createSupabaseServiceClient()

    const { data: session } = await db
      .from('bot_sessions')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    if (!session) {
      await ctx.reply('Send /start to submit your daily report.')
      return
    }

    if (session.step === 'work') {
      if (!text) {
        await ctx.reply('Please describe what you did today.')
        return
      }

      await db.from('bot_sessions').update({
        step: 'notes',
        work_description: text,
        updated_at: new Date().toISOString(),
      }).eq('telegram_user_id', telegramUserId)

      await ctx.reply(
        'Any notes? You can skip.',
        Markup.inlineKeyboard([Markup.button.callback('Skip', 'skip_notes')])
      )
      return
    }

    if (session.step === 'notes') {
      await handleNotesAndShowSummary(ctx, telegramUserId, session, text)
      return
    }

    if (session.step === 'project') {
      await ctx.reply('Please choose a project from the options above.')
      return
    }

    if (session.step === 'confirm') {
      await ctx.reply('Please tap Confirm or Start Over.')
      return
    }
  })

  // Skip notes
  bot.action('skip_notes', async (ctx) => {
    const telegramUserId = ctx.from!.id
    const db = createSupabaseServiceClient()

    const { data: session } = await db
      .from('bot_sessions')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    if (!session) { await ctx.answerCbQuery(); return }

    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await handleNotesAndShowSummary(ctx, telegramUserId, session, null)
  })
}

async function handleNotesAndShowSummary(
  ctx: BotContext,
  telegramUserId: number,
  session: { project_name: string | null; work_description: string | null; notes: string | null },
  notes: string | null
) {
  const db = createSupabaseServiceClient()

  await db.from('bot_sessions').update({
    step: 'confirm',
    notes,
    updated_at: new Date().toISOString(),
  }).eq('telegram_user_id', telegramUserId)

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const summary = [
    `*Summary*`,
    `📅 Date: ${today}`,
    `📍 Project: ${session.project_name}`,
    `📝 Work: ${session.work_description}`,
    notes ? `💬 Notes: ${notes}` : null,
  ].filter(Boolean).join('\n')

  await ctx.reply(
    summary,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('✓ Confirm', 'confirm'),
        Markup.button.callback('↩ Start Over', 'start_over'),
      ]),
    }
  )
}
