'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  resourceType: 'file' | 'folder'
  resourceId: string
  currentName: string
}

export function RenameDialog({ open, onClose, onSuccess, resourceType, resourceId, currentName }: Props) {
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRename() {
    if (!name.trim() || name === currentName) return
    setLoading(true)
    setError(null)
    try {
      await apiFetch(`/${resourceType === 'file' ? 'files' : 'folders'}/${resourceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {resourceType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleRename} disabled={loading || !name.trim() || name === currentName} className="cursor-pointer">
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
