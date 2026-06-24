import { createSupabaseServiceClient } from '@/lib/supabase/server'
import ProjectsClient from './projects-client'

export default async function ProjectsPage() {
  const db = createSupabaseServiceClient()
  const { data: projects } = await db
    .from('projects')
    .select('*')
    .order('name')

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">פרויקטים</h1>
      <p className="text-sm text-gray-500">
        עובדים בוחרים מהרשימה הזו בעת הגשת דוחות. פרויקטים מושבתים לא מופיעים בבוט.
      </p>
      <ProjectsClient projects={projects ?? []} />
    </div>
  )
}
