import { SUPABASE_ANON_KEY, SUPABASE_URL } from 'livelawyerlibrary/env'
import Account from './account'

export default async function Page() {
  return <Account supabaseUrl={SUPABASE_URL} supabaseAnonKey={SUPABASE_ANON_KEY} />
}
