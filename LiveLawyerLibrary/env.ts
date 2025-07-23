import dotenv from 'dotenv'
import { defaultEnvironmentVariableWithWarning } from '.'

function getBackendVariables(): [websiteUrl: string, supabaseUrl: string, supabaseAnonKey: string] {
  let dir = __dirname
  const NEXTJS_WRONG_PATH = /LiveLawyerWeb\/\.next\/server\/app.*$/
  if (dir.match(NEXTJS_WRONG_PATH)) {
    dir = dir.replace(NEXTJS_WRONG_PATH, 'LiveLawyerLibrary')
  }
  const path = dir + '/.env'
  dotenv.config({ path: path })
  let websiteUrl = defaultEnvironmentVariableWithWarning(
    process.env.WEBSITE_URL,
    'WEBSITE_URL',
    path,
    'https://localhost:3000/',
    true,
  )
  if (!websiteUrl.endsWith('/')) {
    websiteUrl += '/'
  }
  const supabaseUrl = defaultEnvironmentVariableWithWarning(
    process.env.SUPABASE_URL,
    'SUPABASE_URL',
    path,
    '',
    true,
  )
  const supabaseAnonKey = defaultEnvironmentVariableWithWarning(
    process.env.SUPABASE_ANON_KEY,
    'SUPABASE_ANON_KEY',
    path,
    '',
    true,
  )
  return [websiteUrl, supabaseUrl, supabaseAnonKey]
}

export const [WEBSITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY] = getBackendVariables()
export const BACKEND_URL = WEBSITE_URL + `api/backend/`
