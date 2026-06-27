import { createSupabaseServiceClient } from '@/lib/supabase/server'
import ReportCard from '@/components/report-card'
import FiltersBar from '@/components/filters-bar'
import ExportCsvButton from '@/components/export-csv-button'
import Link from 'next/link'
import type { DailyReport } from '@/lib/supabase/types'

type ReportRow = DailyReport & { employees: { id: string; name: string } | null }

interface Props {
  searchParams: Promise<{
    date_from?: string
    date_to?: string
    employee?: string
    project?: string
    q?: string
  }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams
  const db = createSupabaseServiceClient()

  let query = db
    .from('daily_reports')
    .select('*, employees(id, name)')
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.date_from) query = query.gte('work_date', params.date_from)
  if (params.date_to) query = query.lte('work_date', params.date_to)
  if (params.employee) query = query.eq('employee_id', params.employee)
  if (params.project) query = query.eq('project_id', params.project)
  if (params.q) query = query.or(`work_description.ilike.%${params.q}%,location.ilike.%${params.q}%,notes.ilike.%${params.q}%`)

  const { data: reports } = (await query) as { data: ReportRow[] | null }

  const [{ data: employees }, { data: projects }] = await Promise.all([
    db.from('employees').select('id, name').eq('is_active', true).order('name'),
    db.from('projects').select('id, name').eq('is_active', true).order('name'),
  ]) as [
    { data: { id: string; name: string }[] | null },
    { data: { id: string; name: string }[] | null },
  ]

  const today = new Date().toISOString().slice(0, 10)
  const { data: allActive } = (await db.from('employees').select('id, name').eq('is_active', true).order('name')) as { data: { id: string; name: string }[] | null }
  const { data: submittedToday } = (await db.from('daily_reports').select('employee_id').eq('work_date', today)) as { data: { employee_id: string }[] | null }

  const submittedIds = new Set((submittedToday ?? []).map(r => r.employee_id))
  const notSubmitted = (allActive ?? []).filter(e => !submittedIds.has(e.id))
  const hasFilters = params.date_from || params.date_to || params.employee || params.project || params.q

  return (
    <div className="space-y-5">
      {/* Today's status widget */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">היום</h2>
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-1">הגישו</p>
            <p className="text-2xl font-bold text-green-600">{submittedIds.size}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">חסרים</p>
            <p className="text-2xl font-bold text-red-500">{notSubmitted.length}</p>
          </div>
        </div>
        {notSubmitted.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            לא הגישו: {notSubmitted.map(e => e.name).join(', ')}
          </p>
        )}
      </div>

      {/* Filters + export */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <FiltersBar
            employees={employees ?? []}
            projects={projects ?? []}
            current={params}
          />
        </div>
        <ExportCsvButton params={params} />
      </div>

      {/* Reports */}
      {!reports || reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">{hasFilters ? 'אין דוחות התואמים לסינון.' : 'אין דוחות עדיין.'}</p>
          {hasFilters && (
            <Link href="/reports" className="mt-2 inline-block text-sm text-blue-600 underline">
              נקה סינון
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {reports.map(r => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-right px-4 py-3 font-medium text-gray-500">תאריך</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">עובד</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">פרויקט</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">עבודה</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">תשלום</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">סטטוס</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {new Date(r.work_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{r.employees?.name}</td>
                    <td className="px-4 py-3 text-gray-700">{r.location}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{r.work_description}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {r.payment_type === 'daily' && `יומי ₪${r.daily_rate}`}
                      {r.payment_type === 'per_slide' && `₪${r.price_per_slide}×${r.slides_count}`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/reports/${r.id}`} className="text-blue-600 hover:underline font-medium">
                        עריכה
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      status === 'reviewed'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {status === 'reviewed' ? 'נבדק' : 'הוגש'}
    </span>
  )
}
