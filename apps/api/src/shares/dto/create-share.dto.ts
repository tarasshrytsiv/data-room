import { IsEmail, IsIn, IsISO8601, IsOptional, IsString } from 'class-validator'

export class CreateShareDto {
  @IsIn(['PUBLIC', 'PERMISSIONED'])
  type: 'PUBLIC' | 'PERMISSIONED'

  @IsIn(['VIEWER', 'EDITOR'])
  role: 'VIEWER' | 'EDITOR'

  @IsOptional()
  @IsString()
  dataRoomId?: string

  @IsOptional()
  @IsString()
  folderId?: string

  @IsOptional()
  @IsString()
  fileId?: string

  @IsOptional()
  @IsEmail()
  sharedWithEmail?: string

  @IsOptional()
  @IsISO8601()
  expiresAt?: string
}
