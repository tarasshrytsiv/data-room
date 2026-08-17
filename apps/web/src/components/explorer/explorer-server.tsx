import { ExplorerClient } from './explorer-client'
import type { FolderContentsResponse } from '@repo/types'

type Props = {
  roomId: string
  folderId: string | null
  token: string
  initialData?: FolderContentsResponse
  dataRoomId: string
}

export function ExplorerServer({ roomId, folderId, initialData, dataRoomId }: Props) {
  return (
    <ExplorerClient
      roomId={roomId}
      folderId={folderId}
      initialData={initialData}
      dataRoomId={dataRoomId}
    />
  )
}
