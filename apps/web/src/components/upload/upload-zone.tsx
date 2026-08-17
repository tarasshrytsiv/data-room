'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  onFiles: (files: File[]) => void
  children: React.ReactNode
}

export function UploadZone({ onFiles, children }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf')
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative min-h-[200px] rounded-xl border-2 border-dashed transition-colors duration-200',
        dragging ? 'border-[var(--color-primary)] bg-blue-50' : 'border-[var(--color-border)]',
      )}
    >
      {dragging && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Upload size={24} className="text-[var(--color-primary)] mb-2" />
          <p className="text-sm text-[var(--color-primary)] font-medium">Drop PDF files here</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
        aria-label="Upload PDF files"
      />
      {!dragging && children}
    </div>
  )
}
