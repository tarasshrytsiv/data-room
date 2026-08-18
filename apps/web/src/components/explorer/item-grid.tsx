'use client'

import { FolderItem } from './folder-item'
import { FileItem } from './file-item'
import { EmptyState } from './empty-state'
import type { FolderDto, FileDto } from '@repo/types'

type Item = FolderDto | FileDto

function isFolder(item: Item): item is FolderDto {
  return 'dataRoomId' in item
}

type Props = {
  items: Item[]
  roomId: string
  onView: (file: FileDto) => void
  onRefresh: () => void
  readOnly?: boolean
}

export function ItemGrid({ items, roomId, onView, onRefresh, readOnly }: Props) {
  if (items.length === 0) return <EmptyState />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {items.map((item) =>
        isFolder(item) ? (
          <FolderItem
            key={item.id}
            folder={item}
            roomId={roomId}
            onAction={onRefresh}
            readOnly={readOnly}
          />
        ) : (
          <FileItem
            key={item.id}
            file={item}
            onView={onView}
            onAction={onRefresh}
            readOnly={readOnly}
            roomId={readOnly ? undefined : roomId}
          />
        ),
      )}
    </div>
  )
}
