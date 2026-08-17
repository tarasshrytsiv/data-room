import { FolderOpen } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FolderOpen size={40} className="text-[var(--color-muted-foreground)] mb-3" />
      <p className="text-sm text-[var(--color-muted-foreground)]">This folder is empty</p>
      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Upload files or create folders to get started</p>
    </div>
  )
}
