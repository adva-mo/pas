'use client'

interface Props {
  params: {
    date_from?: string
    date_to?: string
    employee?: string
    project?: string
    q?: string
  }
}

export default function ExportCsvButton({ params }: Props) {
  function handleExport() {
    const qs = new URLSearchParams()
    if (params.date_from) qs.set('date_from', params.date_from)
    if (params.date_to) qs.set('date_to', params.date_to)
    if (params.employee) qs.set('employee', params.employee)
    if (params.project) qs.set('project', params.project)
    if (params.q) qs.set('q', params.q)
    window.location.href = `/api/reports/export?${qs.toString()}`
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 h-10 px-4 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 shrink-0"
      title="ייצוא CSV"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <span className="hidden sm:inline">ייצוא</span>
    </button>
  )
}
