import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/server'

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsvRow(cols: (string | null | undefined)[]): string {
  return cols.map(escapeCsv).join(',')
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = req.nextUrl.searchParams
  const db = createSupabaseServiceClient()

  let query = db
    .from('daily_reports')
    .select('*, employees(name)')
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.get('date_from')) query = query.gte('work_date', params.get('date_from')!)
  if (params.get('date_to')) query = query.lte('work_date', params.get('date_to')!)
  if (params.get('employee')) query = query.eq('employee_id', params.get('employee')!)
  if (params.get('project')) query = query.eq('project_id', params.get('project')!)
  if (params.get('q')) {
    const q = params.get('q')!
    query = query.or(`work_description.ilike.%${q}%,location.ilike.%${q}%,notes.ilike.%${q}%`)
  }

  const { data: reports } = await query

  const header = toCsvRow(['Date', 'Employee', 'Project', 'Work description', 'Notes', 'Status', 'Admin notes', 'Submitted at'])
  const rows = (reports ?? []).map(r => toCsvRow([
    r.work_date,
    (r as any).employees?.name,
    r.location,
    r.work_description,
    r.notes,
    r.status,
    r.admin_notes,
    r.created_at,
  ]))

  const csv = [header, ...rows].join('\n')
  const filename = `reports-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
