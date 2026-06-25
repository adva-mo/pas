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

    it('saves work description and asks for notes', async () => {
      const ctx = makeCtx({ message: { text: 'פיתוח ממשק משתמש' } })
      await bot.triggerText(ctx)

      expect(db.chains.bot_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'notes', work_description: 'פיתוח ממשק משתמש' })
      )
      expect(ctx.reply).toHaveBeenCalledWith('יש הערות? אפשר לדלג.', expect.anything())
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
})
