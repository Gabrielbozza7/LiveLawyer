import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { defaultEnvironmentVariableWithWarning } from 'livelawyerlibrary'
import { resolve } from 'path'
import { Database } from 'livelawyerlibrary/SupabaseTypes'

let supabase: SupabaseClient<Database> | undefined = undefined

export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  if (supabase) {
    return supabase
  }
  dotenv.config()
  const path = resolve(process.cwd(), '.env')
  const supabaseUrl = defaultEnvironmentVariableWithWarning(
    process.env.SUPABASE_URL,
    'SUPABASE_URL',
    path,
    'abc',
    true,
  )
  const supabaseKey = defaultEnvironmentVariableWithWarning(
    process.env.SUPABASE_KEY,
    'SUPABASE_KEY',
    path,
    'abc',
    true,
  )
  const databaseUser = defaultEnvironmentVariableWithWarning(
    process.env.DATABASE_USER,
    'DATABASE_USER',
    path,
    'abc',
    true,
  )
  const databasePassword = defaultEnvironmentVariableWithWarning(
    process.env.DATABASE_PASSWORD,
    'DATABASE_PASSWORD',
    path,
    'abc',
    true,
  )

  const { error } = await supabase.auth.signInWithPassword({
    email: databaseUser,
    password: databasePassword,
  })
  if (error) {
    throw error
  }

  supabase = createClient(supabaseUrl, supabaseKey)
  return supabase
}
