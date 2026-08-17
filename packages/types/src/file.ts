export interface FileDto {
  id: string
  name: string
  mimeType: string
  size: number
  folderId: string
  createdAt: string
  updatedAt: string
}

export interface CreateFileDto {
  name: string
  folderId: string
  storageKey: string
  mimeType: string
  size: number
}

export interface UpdateFileDto {
  name: string
}

export interface MoveFileDto {
  targetFolderId: string
}

export interface PresignedUrlResponse {
  url: string
  storageKey: string
}

export interface ViewUrlResponse {
  url: string
}
