import { createSupabaseServiceClient } from '@/lib/supabase/server'
import ProjectsClient from './projects-client'

export default async function ProjectsPage() {
  const db = createSupabaseServiceClient()
  const { data: projects } = await db
    .from('projects')
    .select('*')
    .order('sort_order')
    .order('name')

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
      <p className="text-sm text-gray-500">
        Employees choose from this list when submitting reports. Deactivated projects are hidden from the bot.
      </p>
      <ProjectsClient projects={projects ?? []} />
    </div>
  )
}
