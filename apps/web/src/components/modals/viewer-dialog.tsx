'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import type { FileDto, ViewUrlResponse } from '@repo/types'

type Props = { file: FileDto; onClose: () => void }

export function ViewerDialog({ file, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<ViewUrlResponse>(`/files/${file.id}/view-url`).then((r) => setUrl(r.url))
  }, [file.id])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-foreground)]">
        <span className="text-sm text-white font-medium truncate max-w-md">{file.name}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors duration-150 cursor-pointer">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1">
        {url ? (
          <iframe src={url} className="w-full h-full" title={file.name} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50 text-sm">Loading…</div>
        )}
      </div>
    </div>
  )
}
