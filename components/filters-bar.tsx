'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Props {
  employees: { id: string; name: string }[]
  projects: { id: string; name: string }[]
  current: {
    date_from?: string
    date_to?: string
    employee?: string
    project?: string
    q?: string
  }
}

export default function FiltersBar({ employees, projects, current }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date_from: current.date_from ?? '',
    date_to: current.date_to ?? '',
    employee: current.employee ?? '',
    project: current.project ?? '',
    q: current.q ?? '',
  })
  const router = useRouter()
  const pathname = usePathname()

  const activeCount = [
    current.date_from, current.date_to, current.employee, current.project, current.q
  ].filter(Boolean).length

  function apply() {
    const params = new URLSearchParams()
    if (form.date_from) params.set('date_from', form.date_from)
    if (form.date_to) params.set('date_to', form.date_to)
    if (form.employee) params.set('employee', form.employee)
    if (form.project) params.set('project', form.project)
    if (form.q) params.set('q', form.q)
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  function clear() {
    setForm({ date_from: '', date_to: '', employee: '', project: '', q: '' })
    router.push(pathname)
    setOpen(false)
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
        </svg>
        Filter
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <input
              type="text"
              placeholder="Work description, location, notes…"
              value={form.q}
              onChange={e => setForm(f => ({ ...f, q: e.target.value }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={form.date_from}
                onChange={e => setForm(f => ({ ...f, date_from: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={form.date_to}
                onChange={e => setForm(f => ({ ...f, date_to: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
            <select
              value={form.employee}
              onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
            <select
              value={form.project}
              onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={apply}
              className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
            >
              Apply
            </button>
            {activeCount > 0 && (
              <button
                onClick={clear}
                className="h-11 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
