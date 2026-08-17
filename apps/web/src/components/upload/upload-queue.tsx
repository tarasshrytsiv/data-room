'use client'

import { UploadProgressItem } from './upload-progress-item'
import type { UploadItem } from '@/hooks/use-upload'

type Props = { items: UploadItem[] }

export function UploadQueue({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-white rounded-xl border shadow-lg p-4 space-y-3 z-50">
      <p className="text-xs font-semibold text-[var(--color-foreground)]">Uploading files</p>
      {items.map((item) => (
        <UploadProgressItem key={item.id} item={item} />
      ))}
    </div>
  )
}
