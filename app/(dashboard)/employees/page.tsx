import { createSupabaseServiceClient } from '@/lib/supabase/server'
import EmployeesClient from './employees-client'

export default async function EmployeesPage() {
  const db = createSupabaseServiceClient()
  const { data: employees } = await db
    .from('employees')
    .select('*')
    .order('name')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
      </div>
      <EmployeesClient employees={employees ?? []} />
    </div>
  )
}
