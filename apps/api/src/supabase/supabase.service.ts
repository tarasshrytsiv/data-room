import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient

  constructor(config: ConfigService) {
    this.client = createClient(
      config.getOrThrow('NEXT_PUBLIC_SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_KEY'),
    )
  }
}
