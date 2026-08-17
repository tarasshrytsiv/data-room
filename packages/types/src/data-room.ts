export interface DataRoomDto {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDataRoomDto {
  name: string
}

export interface UpdateDataRoomDto {
  name: string
}
