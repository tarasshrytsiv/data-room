export type ShareType = 'PUBLIC' | 'PERMISSIONED'
export type ShareRole = 'VIEWER' | 'EDITOR'

export interface ShareDto {
  id: string
  type: ShareType
  token: string
  role: ShareRole
  dataRoomId: string | null
  folderId: string | null
  fileId: string | null
  sharedById: string
  sharedWithId: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface CreateShareDto {
  type: ShareType
  role: ShareRole
  dataRoomId?: string
  folderId?: string
  fileId?: string
  sharedWithEmail?: string
  expiresAt?: string
}

export interface SearchDto {
  q: string
  type?: 'file' | 'folder' | 'all'
  mimeType?: string[]
  folderId?: string
  sort?: 'name' | 'createdAt' | 'size'
  order?: 'asc' | 'desc'
  cursor?: string
  limit?: number
}
