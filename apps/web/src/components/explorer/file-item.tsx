'use client'

import { useState } from 'react'
import { FileText, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RenameDialog } from '@/components/modals/rename-dialog'
import { DeleteConfirmDialog } from '@/components/modals/delete-confirm-dialog'
import { ShareDialog } from '@/components/share/share-dialog'
import type { FileDto } from '@repo/types'

type Props = {
  file: FileDto
  onView: (file: FileDto) => void
  onAction?: () => void
  readOnly?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileItem({ file, onView, onAction, readOnly }: Props) {
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sharing, setSharing] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-white hover:shadow-sm transition-all duration-200 group">
        <button
          onClick={() => onView(file)}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
        >
          <FileText size={20} className="text-[var(--color-muted-foreground)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-150">
              {file.name}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">{formatBytes(file.size)}</p>
          </div>
        </button>
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
        onSuccess={() => onAction?.()}
        resourceType="file"
        resourceId={file.id}
        currentName={file.name}
      />
      <DeleteConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onSuccess={() => onAction?.()}
        resourceType="file"
        resourceId={file.id}
        resourceName={file.name}
      />
      <ShareDialog
        open={sharing}
        onClose={() => setSharing(false)}
        target={{ type: 'file', id: file.id }}
      />
    </>
  )
}
