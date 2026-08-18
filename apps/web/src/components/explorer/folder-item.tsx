'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Folder, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RenameDialog } from '@/components/modals/rename-dialog'
import { DeleteConfirmDialog } from '@/components/modals/delete-confirm-dialog'
import { ShareDialog } from '@/components/share/share-dialog'
import type { FolderDto } from '@repo/types'

type Props = { folder: FolderDto; roomId: string; onAction: () => void; readOnly?: boolean }

export function FolderItem({ folder, roomId, onAction, readOnly }: Props) {
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sharing, setSharing] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-white hover:shadow-sm transition-all duration-200 group">
        {!readOnly && roomId ? (
          <Link
            href={`/rooms/${roomId}/folders/${folder.id}`}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          >
            <Folder size={20} className="text-[var(--color-primary)] shrink-0" />
            <span className="text-sm font-medium text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-150">
              {folder.name}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Folder size={20} className="text-[var(--color-primary)] shrink-0" />
            <span className="text-sm font-medium text-[var(--color-foreground)] truncate">
              {folder.name}
            </span>
          </div>
        )}
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={14} className="text-[var(--color-muted-foreground)]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setRenaming(true)}>Rename</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSharing(true)}>Share</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={() => setDeleting(true)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <RenameDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        onSuccess={onAction}
        resourceType="folder"
        resourceId={folder.id}
        currentName={folder.name}
      />
      <DeleteConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onSuccess={onAction}
        resourceType="folder"
        resourceId={folder.id}
        resourceName={folder.name}
      />
      <ShareDialog
        open={sharing}
        onClose={() => setSharing(false)}
        target={{ type: 'folder', id: folder.id }}
      />
    </>
  )
}
