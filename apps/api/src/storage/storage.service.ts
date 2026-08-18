import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

const BUCKET = 'data-room-files'
const UPLOAD_TTL = 900
const VIEW_TTL = 3600

@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseService) {}

  async createUploadUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.supabase.client.storage
      .from(BUCKET)
      .createSignedUploadUrl(storageKey)

    if (error) throw new Error(error.message)
    return data.signedUrl
  }

  async createViewUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.supabase.client.storage
      .from(BUCKET)
      .createSignedUrl(storageKey, VIEW_TTL)

    if (error) throw new Error(error.message)
    return data.signedUrl
  }

  async deleteObject(storageKey: string): Promise<void> {
    const { error } = await this.supabase.client.storage
      .from(BUCKET)
      .remove([storageKey])

    if (error) throw new Error(error.message)
  }
}
