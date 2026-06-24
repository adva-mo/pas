'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/reports', label: 'דוחות' },
  { href: '/employees', label: 'עובדים' },
  { href: '/projects', label: 'פרויקטים' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200"
        aria-label="Menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-4 top-14 z-30 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                התנתקות
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
