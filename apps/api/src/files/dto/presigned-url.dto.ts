import { IsString } from 'class-validator'

export class PresignedUrlDto {
  @IsString()
  folderId: string

  @IsString()
  fileName: string
}
