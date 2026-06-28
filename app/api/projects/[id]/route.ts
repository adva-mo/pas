import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = createSupabaseServiceClient()

  const update: Record<string, unknown> = {}
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (name.length > 30) return NextResponse.json({ error: 'Project name must be 30 characters or fewer' }, { status: 400 })
    update.name = name
  }
  if (body.is_active !== undefined) update.is_active = body.is_active

  const { error } = await db.from('projects').update(update).eq('id', id)
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A project with this name already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
