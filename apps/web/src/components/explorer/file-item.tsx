'use client'

import { FileText } from 'lucide-react'
import type { FileDto } from '@repo/types'

type Props = {
  file: FileDto
  onView: (file: FileDto) => void
  readOnly?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileItem({ file, onView }: Props) {
  return (
    <button
      onClick={() => onView(file)}
      className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-all duration-200 cursor-pointer group w-full text-left"
    >
      <FileText size={20} className="text-[var(--color-muted-foreground)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-150">
          {file.name}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{formatBytes(file.size)}</p>
      </div>
    </button>
  )
}
