'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Employee } from '@/lib/supabase/types'

export default function EmployeesClient({ employees }: { employees: Employee[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', telegram_user_id: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')

    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        telegram_user_id: Number(form.telegram_user_id),
      }),
    })

    setAdding(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to add employee')
      return
    }
    setForm({ name: '', telegram_user_id: '' })
    setShowAdd(false)
    router.refresh()
  }

  async function toggleActive(employee: Employee) {
    await fetch(`/api/employees/${employee.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !employee.is_active }),
    })
    router.refresh()
  }

  function startEdit(employee: Employee) {
    setEditingId(employee.id)
    setEditName(employee.name)
  }

  async function handleEdit(e: React.FormEvent, id: string) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setSaving(false)
    setEditingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Add employee */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-11 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add employee
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Add employee</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                required
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telegram User ID</label>
              <input
                required
                type="number"
                placeholder="e.g. 123456789"
                value={form.telegram_user_id}
                onChange={e => setForm(f => ({ ...f, telegram_user_id: e.target.value }))}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Employee can get their ID by messaging @userinfobot on Telegram</p>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowAdd(false); setError('') }}
                className="flex-1 h-11 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee list */}
      {employees.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-400">No employees yet.</p>
      ) : (
        <div className="space-y-2">
          {employees.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              {editingId === e.id ? (
                <form onSubmit={ev => handleEdit(ev, e.id)} className="space-y-3">
                  <input
                    autoFocus
                    required
                    type="text"
                    value={editName}
                    onChange={ev => setEditName(ev.target.value)}
                    className="w-full h-11 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 h-9 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 h-9 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`font-medium ${e.is_active ? 'text-gray-900' : 'text-gray-400'}`}>{e.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {e.telegram_user_id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(e)}
                      className={`h-9 px-3 rounded-xl text-sm font-medium border transition-colors ${
                        e.is_active
                          ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {e.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(e)}
                      className="h-9 px-3 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      className="h-9 px-3 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === e.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
