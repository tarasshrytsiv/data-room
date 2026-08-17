'use client'

import useSWR from 'swr'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import type { ShareDto } from '@repo/types'

export default function SharedByMePage() {
  const { data: shares, mutate } = useSWR<ShareDto[]>('/shares')

  async function revoke(id: string) {
    await apiFetch(`/shares/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-8">Shared by me</h1>

      {!shares || shares.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">No active shares</p>
      ) : (
        <div className="space-y-3">
          {shares.map((share) => (
            <div key={share.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  {share.type === 'PUBLIC' ? 'Public link' : 'Shared with user'}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  {share.dataRoomId ? 'Data Room' : share.folderId ? 'Folder' : 'File'} · {share.role}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => revoke(share.id)}
                className="cursor-pointer text-[var(--color-destructive)] hover:border-[var(--color-destructive)]"
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
