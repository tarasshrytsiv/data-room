import { IsInt, IsString, Min, MinLength } from 'class-validator'

export class CreateFileDto {
  @IsString()
  @MinLength(1)
  name: string

  @IsString()
  folderId: string

  @IsString()
  storageKey: string

  @IsString()
  mimeType: string

  @IsInt()
  @Min(0)
  size: number
}
