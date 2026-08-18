'use client'

import { ItemGrid } from './item-grid'
import { apiFetch } from '@/lib/api'
import type { FolderDto, FileDto } from '@repo/types'

type Item = FolderDto | FileDto

export function ReadonlyItemGrid({ items, token }: { items: Item[]; token: string }) {
  async function handleView(file: FileDto) {
    try {
      const { viewUrl } = await apiFetch<{ viewUrl: string }>(
        `/shared/${token}/files/${file.id}/view-url`,
      )
      window.open(viewUrl, '_blank', 'noopener,noreferrer')
    } catch {
      // ignore
    }
  }

  return (
    <ItemGrid
      items={items}
      roomId=""
      onView={handleView}
      onRefresh={() => {}}
      readOnly
    />
  )
}
