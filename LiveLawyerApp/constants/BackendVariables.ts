import { defaultEnvironmentVariableWithWarning } from 'livelawyerlibrary'

// I would like to be able to use the exports from 'livelawyerlibrary/env', but importing them breaks the bundler due to the use
// of the 'path' module in the library's dependency 'dotenv', which doesn't exist in React Native. So, unless a solution for that
// is found, we will have to continue having the backend IP duplicated.

export function getBackendVariables(): [
  websiteUrl: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
] {
  const path = 'LiveLawyerApp/.env'
  let websiteUrl = defaultEnvironmentVariableWithWarning(
    process.env.EXPO_PUBLIC_WEBSITE_URL,
    'EXPO_PUBLIC_WEBSITE_URL',
    path,
    'https://localhost:3000/',
    true,
  )
  if (!websiteUrl.endsWith('/')) {
    websiteUrl += '/'
  }
  const supabaseUrl = defaultEnvironmentVariableWithWarning(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    'EXPO_PUBLIC_SUPABASE_URL',
    path,
    '',
    true,
  )
  const supabaseAnonKey = defaultEnvironmentVariableWithWarning(
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    path,
    '',
    true,
  )
  return [websiteUrl, supabaseUrl, supabaseAnonKey]
}

export const [WEBSITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY] = getBackendVariables()
export const BACKEND_URL = WEBSITE_URL + `api/backend/`
