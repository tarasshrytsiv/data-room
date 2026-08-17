import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Crumb = { id: string; name: string }

type Props = {
  roomId: string
  crumbs: Crumb[]
}

export function ExplorerBreadcrumb({ roomId, crumbs }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      <Link
        href={`/rooms/${roomId}`}
        className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors duration-150 cursor-pointer"
      >
        Root
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-[var(--color-muted-foreground)]" />
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-[var(--color-foreground)]">{crumb.name}</span>
          ) : (
            <Link
              href={`/rooms/${roomId}/folders/${crumb.id}`}
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors duration-150 cursor-pointer"
            >
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
