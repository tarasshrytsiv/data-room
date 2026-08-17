'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ShareLinkCopy } from './share-link-copy'
import { apiFetch } from '@/lib/api'
import type { ShareDto } from '@repo/types'

type Target =
  | { type: 'room'; id: string }
  | { type: 'folder'; id: string }
  | { type: 'file'; id: string }

type Props = { open: boolean; onClose: () => void; target: Target }

export function ShareDialog({ open, onClose, target }: Props) {
  const [mode, setMode] = useState<'public' | 'email'>('public')
  const [email, setEmail] = useState('')
  const [share, setShare] = useState<ShareDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      const body = {
        type: mode === 'public' ? 'PUBLIC' : 'PERMISSIONED',
        role: 'VIEWER' as const,
        ...(target.type === 'room' ? { dataRoomId: target.id } : {}),
        ...(target.type === 'folder' ? { folderId: target.id } : {}),
        ...(target.type === 'file' ? { fileId: target.id } : {}),
        ...(mode === 'email' ? { sharedWithEmail: email } : {}),
      }

      const result = await apiFetch<ShareDto>('/shares', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      setShare(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setShare(null)
    setEmail('')
    setError(null)
    setMode('public')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>

        {share ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[var(--color-foreground)]">
              {share.type === 'PUBLIC' ? 'Anyone with the link can view' : `Shared with ${email}`}
            </p>
            {share.type === 'PUBLIC' && <ShareLinkCopy token={share.token} />}
            <Button variant="outline" onClick={handleClose} className="w-full cursor-pointer">Done</Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                className={`flex-1 py-2 text-sm transition-colors duration-150 cursor-pointer ${mode === 'public' ? 'bg-[var(--color-muted)] font-semibold' : 'text-[var(--color-muted-foreground)]'}`}
                onClick={() => setMode('public')}
              >
                Public link
              </button>
              <button
                className={`flex-1 py-2 text-sm transition-colors duration-150 cursor-pointer ${mode === 'email' ? 'bg-[var(--color-muted)] font-semibold' : 'text-[var(--color-muted-foreground)]'}`}
                onClick={() => setMode('email')}
              >
                Invite by email
              </button>
            </div>

            {mode === 'email' && (
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}

            <Button
              onClick={handleCreate}
              disabled={loading || (mode === 'email' && !email)}
              className="w-full cursor-pointer bg-[var(--color-accent)] hover:bg-orange-700"
            >
              {loading ? 'Creating…' : 'Create share'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
