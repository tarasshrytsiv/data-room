'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Data Rooms', icon: Database },
  { href: '/shared-by-me', label: 'Shared by me', icon: Share2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 border-r bg-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b">
        <span className="text-base font-bold text-[var(--color-foreground)]">Data Room</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer',
              pathname === href
                ? 'bg-[var(--color-muted)] text-[var(--color-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t">
        <button
          onClick={signOut}
          className="w-full text-left px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors duration-150 cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
