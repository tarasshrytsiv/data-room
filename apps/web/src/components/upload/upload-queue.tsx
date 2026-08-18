'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { UploadProgressItem } from './upload-progress-item'
import type { UploadItem } from '@/hooks/use-upload'

type Props = { items: UploadItem[] }

export function UploadQueue({ items }: Props) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const hasActive = items.some((i) => i.status === 'uploading' || i.status === 'pending' || i.status === 'error')
    if (hasActive) setHidden(false)
  }, [items])

  if (items.length === 0 || hidden) return null

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-white rounded-xl border shadow-lg p-4 space-y-3 z-50">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--color-foreground)]">Uploading files</p>
        <button
          onClick={() => setHidden(true)}
          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
      {items.map((item) => (
        <UploadProgressItem key={item.id} item={item} />
      ))}
    </div>
  )
}
