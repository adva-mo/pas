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
    .order('name')

  if (!projects || projects.length === 0) {
    await ctx.reply('אין פרויקטים מוגדרים. צור קשר עם המנהל.')
    return
  }

  await ctx.reply('איפה עבדת היום?', buildProjectKeyboard(projects))
}

async function askNotes(ctx: BotContext) {
  await ctx.reply(
    'יש הערות? אפשר לדלג.',
    Markup.inlineKeyboard([Markup.button.callback('דלג', 'skip_notes')])
  )
}

export function registerHandlers(bot: Telegraf) {
  // /start — self-register if unknown, reset session and begin
  bot.start(async (ctx) => {
    const telegramUserId = ctx.from.id
    const db = createSupabaseServiceClient()

    const { data: employee, error: empError } = await db
      .from('employees')
      .select('id, name, is_active')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    if (empError) {
      await ctx.reply(`שגיאה: ${empError.message}`)
      return
    }

    if (employee) {
      if (!employee.is_active) {
        await ctx.reply('החשבון שלך אינו פעיל. פנה למנהל שלך.')
        return
      }
      await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
      await ctx.reply(`היי ${employee.name}! בוא נגיש את הדוח היומי.`)
      await askProject(ctx)
      return
    }

    // Unknown user — check if already mid-onboarding (avoid resetting on /start spam)
    const { data: existingSession } = await db
      .from('bot_sessions')
      .select('step')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    if (existingSession?.step === 'onboarding_name') {
      await ctx.reply('שלום 👋\nאיך קוראים לך?')
      return
    }

    // Start onboarding
    await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
    await db.from('bot_sessions').upsert({
      telegram_user_id: telegramUserId,
      step: 'onboarding_name',
      updated_at: new Date().toISOString(),
    })

    const from = ctx.from
    const displayName = from.last_name
      ? `${from.first_name} ${from.last_name}`
      : from.first_name

    if (displayName) {
      await ctx.reply(
        'שלום 👋\nאיך קוראים לך?',
        Markup.keyboard([[displayName]]).oneTime().resize()
      )
    } else {
      await ctx.reply('שלום 👋\nאיך קוראים לך?')
    }
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
      await ctx.reply('לא רשום במערכת. צור קשר עם המנהל.')
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const { data: existing } = await db
      .from('daily_reports')
      .select('id')
      .eq('employee_id', employee.id)
      .eq('work_date', today)
      .maybeSingle()

    if (existing) {
      await ctx.answerCbQuery()
      await ctx.reply('כבר הגשת דוח להיום.')
      return
    }

    await db.from('bot_sessions').upsert({
      telegram_user_id: telegramUserId,
      step: 'payment_type',
      project_id: projectId,
      project_name: projectName,
      updated_at: new Date().toISOString(),
    })

    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply(
      `פרויקט: ${projectName}\n\nסוג תשלום?`,
      Markup.inlineKeyboard([
        Markup.button.callback('יומי', 'payment:daily'),
        Markup.button.callback('לפי גלישה', 'payment:per_slide'),
      ])
    )
  })

  // Payment type buttons
  bot.action('payment:daily', async (ctx) => {
    const telegramUserId = ctx.from!.id
    const db = createSupabaseServiceClient()

    await db.from('bot_sessions').update({
      step: 'daily_rate',
      payment_type: 'daily',
      updated_at: new Date().toISOString(),
    }).eq('telegram_user_id', telegramUserId)

    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('מה המחיר ליום (בש״ח)?')
  })

  bot.action('payment:per_slide', async (ctx) => {
    const telegramUserId = ctx.from!.id
    const db = createSupabaseServiceClient()

    await db.from('bot_sessions').update({
      step: 'price_per_slide',
      payment_type: 'per_slide',
      updated_at: new Date().toISOString(),
    }).eq('telegram_user_id', telegramUserId)

    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('מה המחיר לגלישה (בש״ח)?')
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
      await ctx.reply('לא רשום במערכת. צור קשר עם המנהל.')
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    const { error } = await db.from('daily_reports').insert({
      employee_id: employee.id,
      project_id: session.project_id,
      location: session.project_name!,
      work_date: today,
      notes: session.notes ?? null,
      payment_type: (session.payment_type as 'daily' | 'per_slide') ?? null,
      daily_rate: session.daily_rate ?? null,
      price_per_slide: session.price_per_slide ?? null,
      slides_count: session.slides_count ?? null,
    })

    if (error) {
      await ctx.answerCbQuery()
      if (error.code === '23505') {
        await ctx.reply('כבר הגשת דוח להיום.')
      } else {
        await ctx.reply('משהו השתבש. נסה שוב עם /start.')
      }
      await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
      return
    }

    await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('הדוח נשמר. ✓\n\nיום טוב!')
  })

  // Start over button
  bot.action('start_over', async (ctx) => {
    const telegramUserId = ctx.from!.id
    const db = createSupabaseServiceClient()
    await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
    await ctx.answerCbQuery()
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('מתחיל מחדש.')
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
      await ctx.reply('שלח /start כדי להגיש את הדוח היומי.')
      return
    }

    if (session.step === 'onboarding_name') {
      const name = text.trim()
      if (name.length < 2) {
        await ctx.reply('השם קצר מדי. אנא הקלד את שמך המלא.', Markup.removeKeyboard())
        return
      }

      const { error } = await db.from('employees').insert({
        name,
        telegram_user_id: telegramUserId,
        telegram_username: ctx.from?.username ?? null,
      })

      if (error) {
        if (error.code === '23505') {
          // Race condition — employee already exists, just continue
          const { data: existing } = await db
            .from('employees')
            .select('id, name')
            .eq('telegram_user_id', telegramUserId)
            .single()
          if (existing) {
            await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
            await ctx.reply(`ברוך הבא חזרה, ${existing.name}!`, Markup.removeKeyboard())
            await askProject(ctx)
            return
          }
        }
        await ctx.reply('אירעה שגיאה. נסה שוב עם /start.')
        return
      }

      await db.from('bot_sessions').delete().eq('telegram_user_id', telegramUserId)
      await ctx.reply(`נעים להכיר, ${name}! 🎉`, Markup.removeKeyboard())
      await askProject(ctx)
      return
    }

    if (session.step === 'daily_rate') {
      const value = parseFloat(text)
      if (isNaN(value) || value <= 0) {
        await ctx.reply('אנא הזן מחיר חוקי (מספר חיובי).')
        return
      }

      await db.from('bot_sessions').update({
        step: 'notes',
        daily_rate: value,
        updated_at: new Date().toISOString(),
      }).eq('telegram_user_id', telegramUserId)

      await askNotes(ctx)
      return
    }

    if (session.step === 'price_per_slide') {
      const value = parseFloat(text)
      if (isNaN(value) || value <= 0) {
        await ctx.reply('אנא הזן מחיר חוקי (מספר חיובי).')
        return
      }

      await db.from('bot_sessions').update({
        step: 'slides_count',
        price_per_slide: value,
        updated_at: new Date().toISOString(),
      }).eq('telegram_user_id', telegramUserId)

      await ctx.reply('כמה גלישות עשית?')
      return
    }

    if (session.step === 'slides_count') {
      const value = parseInt(text, 10)
      if (isNaN(value) || value <= 0) {
        await ctx.reply('אנא הזן מספר גלישות חוקי (מספר שלם חיובי).')
        return
      }

      await db.from('bot_sessions').update({
        step: 'notes',
        slides_count: value,
        updated_at: new Date().toISOString(),
      }).eq('telegram_user_id', telegramUserId)

      await askNotes(ctx)
      return
    }

    if (session.step === 'notes') {
      await handleNotesAndShowSummary(ctx, telegramUserId, session, text)
      return
    }

    if (session.step === 'project' || session.step === 'payment_type' || session.step === 'work') {
      await ctx.reply('אנא בחר מהאפשרויות למעלה.')
      return
    }

    if (session.step === 'confirm') {
      await ctx.reply('אנא לחץ על אשר או התחל מחדש.')
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

type SessionForSummary = {
  project_name: string | null
  notes: string | null
  payment_type: string | null
  daily_rate: number | null
  price_per_slide: number | null
  slides_count: number | null
}

async function handleNotesAndShowSummary(
  ctx: BotContext,
  telegramUserId: number,
  session: SessionForSummary,
  notes: string | null
) {
  const db = createSupabaseServiceClient()

  await db.from('bot_sessions').update({
    step: 'confirm',
    notes,
    updated_at: new Date().toISOString(),
  }).eq('telegram_user_id', telegramUserId)

  const today = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })

  let paymentLine: string | null = null
  if (session.payment_type === 'daily' && session.daily_rate != null) {
    paymentLine = `💰 תשלום: יומי — ₪${session.daily_rate}`
  } else if (session.payment_type === 'per_slide' && session.price_per_slide != null && session.slides_count != null) {
    const total = session.price_per_slide * session.slides_count
    paymentLine = `💰 תשלום: לפי גלישה — ₪${session.price_per_slide} × ${session.slides_count} = ₪${total}`
  }

  const summary = [
    `*סיכום*`,
    `📅 תאריך: ${today}`,
    `📍 פרויקט: ${session.project_name}`,
    paymentLine,
    notes ? `💬 הערות: ${notes}` : null,
  ].filter(Boolean).join('\n')

  await ctx.reply(
    summary,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('✓ אשר', 'confirm'),
        Markup.button.callback('↩ התחל מחדש', 'start_over'),
      ]),
    }
  )
}
