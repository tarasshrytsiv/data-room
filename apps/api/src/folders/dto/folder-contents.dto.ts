import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class FolderContentsDto {
  @IsOptional()
  @IsIn(['name', 'createdAt', 'size'])
  sort?: 'name' | 'createdAt' | 'size'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc'

  @IsOptional()
  @IsIn(['file', 'folder', 'all'])
  type?: 'file' | 'folder' | 'all'

  @IsOptional()
  @IsString()
  cursor?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}
