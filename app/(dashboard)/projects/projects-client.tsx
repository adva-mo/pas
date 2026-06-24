'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/supabase/types'

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', sort_order: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        sort_order: form.sort_order ? Number(form.sort_order) : 0,
      }),
    })

    setAdding(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to add project')
      return
    }
    setForm({ name: '', sort_order: '' })
    setShowAdd(false)
    router.refresh()
  }

  async function toggleActive(project: Project) {
    await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !project.is_active }),
    })
    router.refresh()
  }

  async function handleRename(project: Project) {
    if (!editName.trim() || editName.trim() === project.name) {
      setEditingId(null)
      return
    }
    await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Add project */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-11 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add project
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Add project</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project name</label>
              <input
                required
                type="text"
                placeholder="e.g. Babli Tower"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort order</label>
              <input
                type="number"
                placeholder="0 = first (lower = higher priority)"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

      {/* Project list */}
      {projects.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-400">No projects yet.</p>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border border-gray-200 p-4 ${!p.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {editingId === p.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRename(p)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(p)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full h-9 px-3 border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className={`font-medium truncate ${p.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                        {p.name}
                      </p>
                      {!p.is_active && (
                        <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Order: {p.sort_order}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setEditingId(p.id); setEditName(p.name) }}
                    className="h-9 px-3 rounded-xl text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`h-9 px-3 rounded-xl text-sm font-medium border transition-colors ${
                      p.is_active
                        ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
