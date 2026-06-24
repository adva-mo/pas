import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import ReportEditForm from './report-edit-form'
import type { DailyReport } from '@/lib/supabase/types'

type ReportWithEmployee = DailyReport & { employees: { id: string; name: string } | null }

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const db = createSupabaseServiceClient()

  const [reportRes, projectsRes] = await Promise.all([
    db.from('daily_reports').select('*, employees(id, name)').eq('id', id).maybeSingle(),
    db.from('projects').select('id, name').eq('is_active', true).order('sort_order').order('name'),
  ]) as [
    { data: ReportWithEmployee | null },
    { data: { id: string; name: string }[] | null },
  ]

  const report = reportRes.data
  const projects = projectsRes.data ?? []

  if (!report) notFound()

  return (
    <div>
      <div className="mb-5">
        <a href="/reports" className="text-sm text-blue-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          חזרה לדוחות
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-gray-900">{report.employees?.name}</h1>
          <p className="text-sm text-gray-400">
            {new Date(report.work_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <ReportEditForm report={report} projects={projects} />
      </div>
    </div>
  )
}
