'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyReport } from '@/lib/supabase/types'

type Props = {
  report: DailyReport & { employees: { id: string; name: string } | null }
  projects: { id: string; name: string }[]
}

export default function ReportEditForm({ report, projects }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    project_id: report.project_id ?? '',
    notes: report.notes ?? '',
    status: report.status,
    admin_notes: report.admin_notes ?? '',
    payment_type: report.payment_type ?? null,
    daily_rate: String(report.daily_rate ?? ''),
    price_per_slide: String(report.price_per_slide ?? ''),
    slides_count: String(report.slides_count ?? ''),
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const selectedProject = projects.find(p => p.id === form.project_id)
    const body = {
      project_id: form.project_id || null,
      location: selectedProject?.name ?? report.location,
      notes: form.notes || null,
      status: form.status,
      admin_notes: form.admin_notes || null,
      payment_type: form.payment_type,
      daily_rate: form.payment_type === 'daily' ? (form.daily_rate === '' ? null : Number(form.daily_rate)) : null,
      price_per_slide: form.payment_type === 'per_slide' ? (form.price_per_slide === '' ? null : Number(form.price_per_slide)) : null,
      slides_count: form.payment_type === 'per_slide' ? (form.slides_count === '' ? null : Number(form.slides_count)) : null,
    }

    const res = await fetch(`/api/reports/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)
    if (!res.ok) { setError('שגיאה בשמירה. נסה שוב.'); return }
    router.push('/reports')
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/reports/${report.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) { setError('שגיאה במחיקה. נסה שוב.'); return }
    router.push('/reports')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Project */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">פרויקט</label>
        <select
          value={form.project_id}
          onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
          className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— בחר פרויקט —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">נוכחי: {report.location}</p>
      </div>

      {/* Payment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">סוג תשלום</label>
        <div className="flex gap-3 mb-3">
          {(['daily', 'per_slide'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(f => ({ ...f, payment_type: t }))}
              className={`flex-1 h-11 rounded-xl text-sm font-medium border transition-colors ${
                form.payment_type === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t === 'daily' ? 'יומי' : 'לפי גלישה'}
            </button>
          ))}
        </div>
        {form.payment_type === 'daily' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">תעריף יומי (₪)</label>
            <input
              type="number"
              min={0}
              value={form.daily_rate}
              onChange={e => setForm(f => ({ ...f, daily_rate: e.target.value }))}
              className="w-full h-11 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {form.payment_type === 'per_slide' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">מחיר לגלישה (₪)</label>
              <input
                type="number"
                min={0}
                value={form.price_per_slide}
                onChange={e => setForm(f => ({ ...f, price_per_slide: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">מספר גלישות</label>
              <input
                type="number"
                min={0}
                value={form.slides_count}
                onChange={e => setForm(f => ({ ...f, slides_count: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">הערות</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="אופציונלי"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Admin notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">הערות מנהל</label>
        <textarea
          rows={2}
          value={form.admin_notes}
          onChange={e => setForm(f => ({ ...f, admin_notes: e.target.value }))}
          placeholder="הערות פנימיות (לא גלויות לעובד)"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">סטטוס</label>
        <div className="flex gap-3">
          {(['submitted', 'reviewed'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setForm(f => ({ ...f, status: s }))}
              className={`flex-1 h-11 rounded-xl text-sm font-medium border transition-colors ${
                form.status === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s === 'submitted' ? 'הוגש' : 'נבדק'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 bg-blue-600 text-white rounded-xl text-base font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full h-12 bg-white border border-red-300 text-red-600 rounded-xl text-base font-medium hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            מחק דוח
          </button>
        ) : (
          <div className="border border-red-300 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-700 font-medium text-center">למחוק את הדוח לצמיתות?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 h-11 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-11 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'מוחק...' : 'כן, מחק'}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
