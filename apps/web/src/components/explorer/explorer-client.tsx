'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ItemGrid } from './item-grid'
import { ExplorerToolbar } from './explorer-toolbar'
import { ViewerDialog } from '@/components/modals/viewer-dialog'
import { apiFetch } from '@/lib/api'
import type { FileDto, FolderContentsResponse } from '@repo/types'

type Props = {
  roomId: string
  folderId: string | null
  initialData?: FolderContentsResponse
  dataRoomId: string
}

export function ExplorerClient({ roomId, folderId, initialData, dataRoomId }: Props) {
  const [viewFile, setViewFile] = useState<FileDto | null>(null)

  const key = folderId ? `/folders/${folderId}/contents` : null

  const { data, mutate } = useSWR<FolderContentsResponse>(
    key,
    () => apiFetch(key!, { method: 'QUERY', body: JSON.stringify({ limit: 50 }) }),
    { fallbackData: initialData },
  )

  return (
    <div className="space-y-4">
      <ExplorerToolbar roomId={roomId} folderId={folderId} onRefresh={() => mutate()} dataRoomId={dataRoomId} />
      <ItemGrid
        items={data?.items ?? []}
        roomId={roomId}
        onView={setViewFile}
        onRefresh={() => mutate()}
      />
      {viewFile && (
        <ViewerDialog
          file={viewFile}
          onClose={() => setViewFile(null)}
        />
      )}
    </div>
  )
}
