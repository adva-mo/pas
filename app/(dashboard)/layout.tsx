import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MobileNav from '@/components/mobile-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <span className="font-semibold text-gray-900 text-base">Daily Reports</span>
          <MobileNav />
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
