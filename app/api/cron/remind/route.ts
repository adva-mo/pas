import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { getBot } from '@/lib/telegram/bot'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createSupabaseServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: employees }, { data: submitted }] = await Promise.all([
    db.from('employees').select('id, name, telegram_user_id').eq('is_active', true),
    db.from('daily_reports').select('employee_id').eq('work_date', today),
  ])

  const submittedIds = new Set((submitted ?? []).map(r => r.employee_id))
  const missing = (employees ?? []).filter(e => !submittedIds.has(e.id))

  const bot = getBot()
  await Promise.all(
    missing.map(e =>
      bot.telegram.sendMessage(
        e.telegram_user_id,
        `שלום ${e.name}! עדיין לא הגשת דוח יומי להיום. שלח /start כדי להגיש.`
      )
    )
  )

  return NextResponse.json({ sent: missing.length })
}
