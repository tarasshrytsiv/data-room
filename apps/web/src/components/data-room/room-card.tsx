import Link from 'next/link'
import { Database } from 'lucide-react'
import type { DataRoomDto } from '@repo/types'

type Props = { room: DataRoomDto }

export function RoomCard({ room }: Props) {
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="block p-5 rounded-xl border bg-white hover:shadow-sm transition-shadow duration-200 cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[var(--color-muted)]">
          <Database size={18} className="text-[var(--color-primary)]" />
        </div>
        <span className="font-semibold text-sm text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors duration-150 truncate">
          {room.name}
        </span>
      </div>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {new Date(room.createdAt).toLocaleDateString()}
      </p>
    </Link>
  )
}
