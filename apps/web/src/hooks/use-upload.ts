import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import type { PresignedUrlResponse, CreateFileDto, FileDto } from '@repo/types'

export type UploadItem = {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export function useUpload(folderId: string, onComplete: () => void) {
  const [items, setItems] = useState<UploadItem[]>([])

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const upload = useCallback(
    async (files: File[]) => {
      const newItems: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
      }))

      setItems((prev) => [...prev, ...newItems])

      await Promise.all(
        newItems.map(async (item) => {
          try {
            updateItem(item.id, { status: 'uploading' })

            const { url, storageKey } = await apiFetch<PresignedUrlResponse>(
              '/files/presigned-url',
              {
                method: 'POST',
                body: JSON.stringify({ folderId, fileName: item.file.name }),
              },
            )

            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest()
              xhr.open('PUT', url)
              xhr.setRequestHeader('Content-Type', item.file.type || 'application/octet-stream')
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  updateItem(item.id, { progress: Math.round((e.loaded / e.total) * 100) })
                }
              }
              xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)))
              xhr.onerror = () => reject(new Error('Network error'))
              xhr.send(item.file)
            })

            await apiFetch<FileDto>('/files', {
              method: 'POST',
              body: JSON.stringify({
                name: item.file.name,
                folderId,
                storageKey,
                mimeType: item.file.type || 'application/octet-stream',
                size: item.file.size,
              } satisfies CreateFileDto),
            })

            updateItem(item.id, { status: 'done', progress: 100 })
          } catch (err) {
            updateItem(item.id, { status: 'error', error: (err as Error).message })
          }
        }),
      )

      onComplete()
    },
    [folderId, onComplete],
  )

  function clear() {
    setItems((prev) => prev.filter((i) => i.status !== 'done'))
  }

  return { items, upload, clear }
}
