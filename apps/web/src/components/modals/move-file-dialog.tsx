'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Folder } from 'lucide-react'
import type { FileDto } from '@repo/types'

type FolderOption = { id: string; name: string; parentId: string | null }

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  file: FileDto
  roomId: string
}

export function MoveFileDialog({ open, onClose, onSuccess, file, roomId }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: folders } = useSWR<FolderOption[]>(
    open ? `/data-rooms/${roomId}/folders` : null,
  )

  async function handleMove() {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      await apiFetch(`/files/${file.id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ targetFolderId: selected }),
      })
      onSuccess()
      handleClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSelected(null)
    setError(null)
    onClose()
  }

  const options = folders?.filter((f) => f.id !== file.folderId) ?? []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move &ldquo;{file.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {options.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {folders ? 'No other folders available' : 'Loading…'}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
              {options.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelected(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors cursor-pointer ${
                    selected === folder.id
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'hover:bg-[var(--color-muted)] text-[var(--color-foreground)]'
                  }`}
                >
                  <Folder size={14} className="shrink-0" />
                  {folder.name}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} className="cursor-pointer">Cancel</Button>
            <Button
              onClick={handleMove}
              disabled={!selected || loading}
              className="cursor-pointer bg-[var(--color-accent)] hover:bg-orange-700"
            >
              {loading ? 'Moving…' : 'Move here'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
