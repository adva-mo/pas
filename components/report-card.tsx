import Link from 'next/link'
import type { DailyReport } from '@/lib/supabase/types'

type Props = {
  report: DailyReport & { employees: { id: string; name: string } | null }
}

export default function ReportCard({ report }: Props) {
  const date = new Date(report.work_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{report.employees?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{date} · {report.location}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          report.status === 'reviewed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {report.status === 'reviewed' ? 'נבדק' : 'הוגש'}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{report.work_description}</p>

      {report.notes && (
        <p className="text-xs text-gray-500 italic">{report.notes}</p>
      )}

      {report.payment_type && (
        <p className="text-xs text-gray-500">
          {report.payment_type === 'daily'
            ? `💰 יומי — ₪${report.daily_rate}`
            : `💰 לפי גלישה — ₪${report.price_per_slide} × ${report.slides_count} = ₪${(report.price_per_slide! * report.slides_count!)}`
          }
        </p>
      )}

      {report.admin_notes && (
        <div className="bg-blue-50 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-600 font-medium mb-0.5">הערת מנהל</p>
          <p className="text-xs text-blue-800">{report.admin_notes}</p>
        </div>
      )}

      <Link
        href={`/reports/${report.id}`}
        className="block text-center w-full h-10 leading-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-sm font-medium text-gray-700 transition-colors"
      >
        עריכה
      </Link>
    </div>
  )
}
