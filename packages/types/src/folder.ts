export interface FolderDto {
  id: string
  name: string
  dataRoomId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateFolderDto {
  name: string
  dataRoomId: string
  parentId?: string
}

export interface UpdateFolderDto {
  name: string
}

export interface FolderContentsDto {
  sort?: 'name' | 'createdAt' | 'size'
  order?: 'asc' | 'desc'
  type?: 'file' | 'folder' | 'all'
  cursor?: string
  limit?: number
}

export interface FolderContentsResponse {
  folder: FolderDto
  breadcrumb: { id: string; name: string }[]
  items: (FileDto | FolderDto)[]
  nextCursor: string | null
}

export interface FolderStatsDto {
  totalSize: number
  itemCount: number
}

import type { FileDto } from './file.js'
