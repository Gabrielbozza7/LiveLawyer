import { BACKEND_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from 'livelawyerlibrary/env'

export interface PublicEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  backendUrl: string
}

export function fetchPublicEnv(): PublicEnv {
  return { supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY, backendUrl: BACKEND_URL }
}
