import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (name.length > 30) return NextResponse.json({ error: 'Project name must be 30 characters or fewer' }, { status: 400 })

  const db = createSupabaseServiceClient()

  const { error } = await db.from('projects').insert({ name })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A project with this name already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
