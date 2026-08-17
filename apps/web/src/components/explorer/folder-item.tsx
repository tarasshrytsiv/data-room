'use client'

import Link from 'next/link'
import { Folder } from 'lucide-react'
import type { FolderDto } from '@repo/types'

type Props = { folder: FolderDto; roomId: string; onAction: () => void; readOnly?: boolean }

export function FolderItem({ folder, roomId, readOnly }: Props) {
  return (
    <Link
      href={`/rooms/${roomId}/folders/${folder.id}`}
      className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-all duration-200 cursor-pointer group"
    >
      <Folder size={20} className="text-[var(--color-primary)] shrink-0" />
      <span className="text-sm font-medium text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-150">
        {folder.name}
      </span>
    </Link>
  )
}
