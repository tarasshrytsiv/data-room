'use client'

import { useRef } from 'react'
import { Upload, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpload } from '@/hooks/use-upload'
import { UploadQueue } from '@/components/upload/upload-queue'

type Props = { roomId: string; folderId: string | null; onRefresh: () => void }

export function ExplorerToolbar({ folderId, onRefresh }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { items, upload, clear } = useUpload(folderId ?? '', onRefresh)

  if (!folderId) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} className="mr-2" />
        Upload
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        aria-label="Move up"
      >
        <FolderPlus size={14} className="mr-2" />
        New folder
      </Button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) upload(files)
          e.target.value = ''
        }}
        aria-label="Upload PDF files"
      />

      <UploadQueue items={items} />
    </div>
  )
}
