'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  resourceType: 'file' | 'folder'
  resourceId: string
  resourceName: string
}

export function DeleteConfirmDialog({ open, onClose, onSuccess, resourceType, resourceId, resourceName }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await apiFetch(`/${resourceType === 'file' ? 'files' : 'folders'}/${resourceId}`, {
      method: 'DELETE',
    })
    onSuccess()
    onClose()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {resourceType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[var(--color-foreground)]">
            Are you sure you want to delete <strong>{resourceName}</strong>?
            {resourceType === 'folder' && ' This will delete all nested folders and files.'}
            {' '}This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
