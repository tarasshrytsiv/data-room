import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'data-room-files'
const UPLOAD_TTL = 900
const VIEW_TTL = 3600

@Injectable()
export class StorageService {
  private supabase: SupabaseClient

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_KEY'),
    )
  }

  async createUploadUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storageKey)

    if (error) throw new Error(error.message)
    return data.signedUrl
  }

  async createViewUrl(storageKey: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(storageKey, VIEW_TTL)

    if (error) throw new Error(error.message)
    return data.signedUrl
  }

  async deleteObject(storageKey: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(BUCKET)
      .remove([storageKey])

    if (error) throw new Error(error.message)
  }
}
