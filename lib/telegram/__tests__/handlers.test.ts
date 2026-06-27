import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerHandlers } from '../handlers'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { makeDb, makeMockBot, makeCtx } from './helpers'

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServiceClient: vi.fn(),
}))

describe('registerHandlers', () => {
  let bot: ReturnType<typeof makeMockBot>
  let db: ReturnType<typeof makeDb>

  beforeEach(() => {
    bot = makeMockBot()
    db = makeDb()
    vi.mocked(createSupabaseServiceClient).mockReturnValue(db as any)
    registerHandlers(bot as any)
  })

  // ─── /start ────────────────────────────────────────────────────────────────

  describe('/start — known active employee', () => {
    it('deletes session, greets, and shows project keyboard', async () => {
      db.chains.employees.maybeSingle.mockResolvedValue({
        data: { id: 'emp-1', name: 'דני', is_active: true },
        error: null,
      })

      const ctx = makeCtx()
      await bot.triggerStart(ctx)

      expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('דני'))
      expect(ctx.reply).toHaveBeenCalledWith('איפה עבדת היום?', expect.anything())
    })
  })

  describe('/start — inactive employee', () => {
    it('replies with inactive message and stops', async () => {
      db.chains.employees.maybeSingle.mockResolvedValue({
        data: { id: 'emp-1', name: 'מוּשהה', is_active: false },
        error: null,
      })

      const ctx = makeCtx()
      await bot.triggerStart(ctx)

      expect(ctx.reply).toHaveBeenCalledTimes(1)
      expect(ctx.reply).toHaveBeenCalledWith('החשבון שלך אינו פעיל. פנה למנהל שלך.')
    })
  })

  describe('/start — unknown user', () => {
    beforeEach(() => {
      db.chains.employees.maybeSingle.mockResolvedValue({ data: null, error: null })
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: null, error: null })
    })

    it('creates onboarding session and asks for name with keyboard suggestion', async () => {
      const ctx = makeCtx({ from: { id: 999, first_name: 'יוסי', last_name: 'לוי', username: 'yossi' } })
      await bot.triggerStart(ctx)

      expect(db.chains.bot_sessions.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'onboarding_name', telegram_user_id: 999 })
      )
      expect(ctx.reply).toHaveBeenCalledWith('שלום 👋\nאיך קוראים לך?', expect.anything())
    })

    it('asks for name without keyboard when no display name', async () => {
      const ctx = makeCtx({ from: { id: 999, first_name: undefined, last_name: undefined, username: 'noname' } })
      await bot.triggerStart(ctx)

      // reply called with just the string (no keyboard arg)
      expect(ctx.reply).toHaveBeenCalledWith('שלום 👋\nאיך קוראים לך?')
    })
  })

  describe('/start — mid-onboarding spam', () => {
    it('re-prompts without resetting session', async () => {
      db.chains.employees.maybeSingle.mockResolvedValue({ data: null, error: null })
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'onboarding_name' },
        error: null,
      })

      const ctx = makeCtx()
      await bot.triggerStart(ctx)

      expect(db.chains.bot_sessions.upsert).not.toHaveBeenCalled()
      expect(ctx.reply).toHaveBeenCalledWith('שלום 👋\nאיך קוראים לך?')
    })
  })

  // ─── onboarding_name text step ─────────────────────────────────────────────

  describe('onboarding_name — text input', () => {
    beforeEach(() => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'onboarding_name' },
        error: null,
      })
    })

    it('rejects name shorter than 2 chars', async () => {
      const ctx = makeCtx({ message: { text: 'א' } })
      await bot.triggerText(ctx)

      expect(ctx.reply).toHaveBeenCalledWith('השם קצר מדי. אנא הקלד את שמך המלא.', expect.anything())
      expect(db.chains.employees.insert).not.toHaveBeenCalled()
    })

    it('inserts employee, confirms, and proceeds to project on valid name', async () => {
      db.chains.employees.insert.mockResolvedValue({ error: null })

      const ctx = makeCtx({ message: { text: 'דני כהן' } })
      await bot.triggerText(ctx)

      expect(db.chains.employees.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'דני כהן',
          telegram_user_id: 123456,
          telegram_username: 'testuser',
        })
      )
      expect(ctx.reply).toHaveBeenCalledWith('נעים להכיר, דני כהן! 🎉', expect.anything())
      expect(ctx.reply).toHaveBeenCalledWith('איפה עבדת היום?', expect.anything())
    })

    it('handles UNIQUE collision — falls through to existing employee', async () => {
      db.chains.employees.insert.mockResolvedValue({ error: { code: '23505' } })
      db.chains.employees.single.mockResolvedValue({
        data: { id: 'emp-2', name: 'דני כהן' },
        error: null,
      })

      const ctx = makeCtx({ message: { text: 'דני כהן' } })
      await bot.triggerText(ctx)

      expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('דני כהן'), expect.anything())
      expect(ctx.reply).toHaveBeenCalledWith('איפה עבדת היום?', expect.anything())
    })

    it('shows error message on unexpected DB failure', async () => {
      db.chains.employees.insert.mockResolvedValue({ error: { code: '99999', message: 'server error' } })

      const ctx = makeCtx({ message: { text: 'דני כהן' } })
      await bot.triggerText(ctx)

      expect(ctx.reply).toHaveBeenCalledWith('אירעה שגיאה. נסה שוב עם /start.')
    })
  })

  // ─── work step ─────────────────────────────────────────────────────────────

  describe('work step — text input', () => {
    beforeEach(() => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'work', project_id: 'proj-1', project_name: 'בבלי' },
        error: null,
      })
    })

    it('saves work description and asks for payment type', async () => {
      const ctx = makeCtx({ message: { text: 'פיתוח ממשק משתמש' } })
      await bot.triggerText(ctx)

      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'payment_type', work_description: 'פיתוח ממשק משתמש' })
      )
      expect(ctx.reply).toHaveBeenCalledWith('סוג תשלום?', expect.anything())
    })
  })

  // ─── payment type actions ──────────────────────────────────────────────────

  describe('payment:daily button', () => {
    it('sets payment_type to daily and asks for daily rate', async () => {
      const ctx = makeCtx()
      await bot.triggerAction('payment:daily', ctx)

      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'daily_rate', payment_type: 'daily' })
      )
      expect(ctx.reply).toHaveBeenCalledWith('מה המחיר ליום (בש״ח)?')
    })
  })

  describe('payment:per_slide button', () => {
    it('sets payment_type to per_slide and asks for price per slide', async () => {
      const ctx = makeCtx()
      await bot.triggerAction('payment:per_slide', ctx)

      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'price_per_slide', payment_type: 'per_slide' })
      )
      expect(ctx.reply).toHaveBeenCalledWith('מה המחיר לשקופית (בש״ח)?')
    })
  })

  // ─── daily_rate step ────────────────────────────────────────────────────────

  describe('daily_rate step — text input', () => {
    beforeEach(() => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'daily_rate', payment_type: 'daily' },
        error: null,
      })
    })

    it('rejects non-numeric input', async () => {
      const ctx = makeCtx({ message: { text: 'לא מספר' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא הזן מחיר חוקי (מספר חיובי).')
      expect(db.chains.bot_sessions.update).not.toHaveBeenCalled()
    })

    it('rejects zero', async () => {
      const ctx = makeCtx({ message: { text: '0' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא הזן מחיר חוקי (מספר חיובי).')
    })

    it('saves daily rate and asks for notes', async () => {
      const ctx = makeCtx({ message: { text: '350' } })
      await bot.triggerText(ctx)
      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'notes', daily_rate: 350 })
      )
      expect(ctx.reply).toHaveBeenCalledWith('יש הערות? אפשר לדלג.', expect.anything())
    })
  })

  // ─── price_per_slide step ──────────────────────────────────────────────────

  describe('price_per_slide step — text input', () => {
    beforeEach(() => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'price_per_slide', payment_type: 'per_slide' },
        error: null,
      })
    })

    it('rejects invalid price', async () => {
      const ctx = makeCtx({ message: { text: 'abc' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא הזן מחיר חוקי (מספר חיובי).')
    })

    it('saves price and asks for slide count', async () => {
      const ctx = makeCtx({ message: { text: '50' } })
      await bot.triggerText(ctx)
      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'slides_count', price_per_slide: 50 })
      )
      expect(ctx.reply).toHaveBeenCalledWith('כמה שקופיות עשית?')
    })
  })

  // ─── slides_count step ─────────────────────────────────────────────────────

  describe('slides_count step — text input', () => {
    beforeEach(() => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'slides_count', payment_type: 'per_slide', price_per_slide: 50 },
        error: null,
      })
    })

    it('rejects non-integer input', async () => {
      const ctx = makeCtx({ message: { text: 'הרבה' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא הזן מספר שקופיות חוקי (מספר שלם חיובי).')
    })

    it('rejects zero', async () => {
      const ctx = makeCtx({ message: { text: '0' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא הזן מספר שקופיות חוקי (מספר שלם חיובי).')
    })

    it('saves slide count and asks for notes', async () => {
      const ctx = makeCtx({ message: { text: '8' } })
      await bot.triggerText(ctx)
      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'notes', slides_count: 8 })
      )
      expect(ctx.reply).toHaveBeenCalledWith('יש הערות? אפשר לדלג.', expect.anything())
    })
  })

  // ─── notes step ────────────────────────────────────────────────────────────

  describe('notes step — text input', () => {
    it('saves notes and shows confirm summary', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'notes', project_name: 'בבלי', work_description: 'פיתוח', notes: null, payment_type: 'daily', daily_rate: 350, price_per_slide: null, slides_count: null },
        error: null,
      })

      const ctx = makeCtx({ message: { text: 'הכל תקין' } })
      await bot.triggerText(ctx)

      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'confirm', notes: 'הכל תקין' })
      )
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('בבלי'),
        expect.anything()
      )
    })
  })

  // ─── wrong step text fallbacks ─────────────────────────────────────────────

  describe('text while waiting for button', () => {
    it('prompts to use keyboard when in project step', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'project' },
        error: null,
      })
      const ctx = makeCtx({ message: { text: 'בבלי' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא בחר מהאפשרויות למעלה.')
    })

    it('prompts to use buttons when in payment_type step', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'payment_type' },
        error: null,
      })
      const ctx = makeCtx({ message: { text: 'יומי' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא בחר מהאפשרויות למעלה.')
    })

    it('prompts to use buttons when in confirm step', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'confirm' },
        error: null,
      })
      const ctx = makeCtx({ message: { text: 'כן' } })
      await bot.triggerText(ctx)
      expect(ctx.reply).toHaveBeenCalledWith('אנא לחץ על אשר או התחל מחדש.')
    })
  })

  // ─── no session ────────────────────────────────────────────────────────────

  describe('text with no session', () => {
    it('prompts user to send /start', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: null, error: null })

      const ctx = makeCtx({ message: { text: 'שלום' } })
      await bot.triggerText(ctx)

      expect(ctx.reply).toHaveBeenCalledWith('שלח /start כדי להגיש את הדוח היומי.')
    })
  })

  // ─── project action ────────────────────────────────────────────────────────

  describe('project button tap', () => {
    const projectCtx = () => makeCtx({ match: ['project:proj-1:בבלי', 'proj-1', 'בבלי'] })

    it('blocks employee not found', async () => {
      db.chains.employees.maybeSingle.mockResolvedValue({ data: null, error: null })
      const ctx = projectCtx()
      await bot.triggerAction('/^project:(.+):(.+)$/', ctx)
      expect(ctx.answerCbQuery).toHaveBeenCalled()
      expect(ctx.reply).toHaveBeenCalledWith('לא רשום במערכת. צור קשר עם המנהל.')
    })

    it('blocks duplicate report for today', async () => {
      db.chains.employees.maybeSingle.mockResolvedValue({ data: { id: 'emp-1' }, error: null })
      db.chains.daily_reports.maybeSingle.mockResolvedValue({ data: { id: 'rep-1' }, error: null })
      const ctx = projectCtx()
      await bot.triggerAction('/^project:(.+):(.+)$/', ctx)
      expect(ctx.reply).toHaveBeenCalledWith('כבר הגשת דוח להיום.')
    })

    it('saves project selection and asks for work description', async () => {
      db.chains.employees.maybeSingle.mockResolvedValue({ data: { id: 'emp-1' }, error: null })
      db.chains.daily_reports.maybeSingle.mockResolvedValue({ data: null, error: null })
      const ctx = projectCtx()
      await bot.triggerAction('/^project:(.+):(.+)$/', ctx)
      expect(db.chains.bot_sessions.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'work', project_id: 'proj-1', project_name: 'בבלי' })
      )
      expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('בבלי'))
    })
  })

  // ─── confirm action ────────────────────────────────────────────────────────

  describe('confirm button', () => {
    const confirmSession = {
      step: 'confirm',
      project_id: 'proj-1',
      project_name: 'בבלי',
      work_description: 'פיתוח',
      notes: null,
    }

    it('does nothing if session is not in confirm step', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'work' },
        error: null,
      })
      const ctx = makeCtx()
      await bot.triggerAction('confirm', ctx)
      expect(ctx.answerCbQuery).toHaveBeenCalled()
      expect(db.chains.daily_reports.insert).not.toHaveBeenCalled()
    })

    it('blocks employee not found', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: confirmSession, error: null })
      db.chains.employees.maybeSingle.mockResolvedValue({ data: null, error: null })
      const ctx = makeCtx()
      await bot.triggerAction('confirm', ctx)
      expect(ctx.reply).toHaveBeenCalledWith('לא רשום במערכת. צור קשר עם המנהל.')
    })

    it('saves report and confirms to user', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: confirmSession, error: null })
      db.chains.employees.maybeSingle.mockResolvedValue({ data: { id: 'emp-1' }, error: null })
      db.chains.daily_reports.insert.mockResolvedValue({ error: null })
      const ctx = makeCtx()
      await bot.triggerAction('confirm', ctx)
      expect(db.chains.daily_reports.insert).toHaveBeenCalledWith(
        expect.objectContaining({ employee_id: 'emp-1', location: 'בבלי', work_description: 'פיתוח' })
      )
      expect(ctx.reply).toHaveBeenCalledWith('הדוח נשמר. ✓\n\nיום טוב!')
    })

    it('shows duplicate error if report already exists', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: confirmSession, error: null })
      db.chains.employees.maybeSingle.mockResolvedValue({ data: { id: 'emp-1' }, error: null })
      db.chains.daily_reports.insert.mockResolvedValue({ error: { code: '23505' } })
      const ctx = makeCtx()
      await bot.triggerAction('confirm', ctx)
      expect(ctx.reply).toHaveBeenCalledWith('כבר הגשת דוח להיום.')
    })

    it('shows generic error on unexpected DB failure', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: confirmSession, error: null })
      db.chains.employees.maybeSingle.mockResolvedValue({ data: { id: 'emp-1' }, error: null })
      db.chains.daily_reports.insert.mockResolvedValue({ error: { code: '99999' } })
      const ctx = makeCtx()
      await bot.triggerAction('confirm', ctx)
      expect(ctx.reply).toHaveBeenCalledWith('משהו השתבש. נסה שוב עם /start.')
    })
  })

  // ─── start_over action ─────────────────────────────────────────────────────

  describe('start_over button', () => {
    it('deletes session and restarts project selection', async () => {
      const ctx = makeCtx()
      await bot.triggerAction('start_over', ctx)
      expect(ctx.answerCbQuery).toHaveBeenCalled()
      expect(ctx.editMessageReplyMarkup).toHaveBeenCalled()
      expect(ctx.reply).toHaveBeenCalledWith('מתחיל מחדש.')
      expect(ctx.reply).toHaveBeenCalledWith('איפה עבדת היום?', expect.anything())
    })
  })

  // ─── skip_notes action ─────────────────────────────────────────────────────

  describe('skip_notes button', () => {
    it('does nothing if no session', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({ data: null, error: null })
      const ctx = makeCtx()
      await bot.triggerAction('skip_notes', ctx)
      expect(ctx.answerCbQuery).toHaveBeenCalled()
      expect(ctx.reply).not.toHaveBeenCalled()
    })

    it('shows confirm summary with no notes', async () => {
      db.chains.bot_sessions.maybeSingle.mockResolvedValue({
        data: { step: 'notes', project_name: 'עזריאלי', work_description: 'ישיבות', notes: null, payment_type: 'per_slide', price_per_slide: 50, slides_count: 8, daily_rate: null },
        error: null,
      })
      const ctx = makeCtx()
      await bot.triggerAction('skip_notes', ctx)
      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'confirm', notes: null })
      )
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('עזריאלי'),
        expect.anything()
      )
    })
  })
})
