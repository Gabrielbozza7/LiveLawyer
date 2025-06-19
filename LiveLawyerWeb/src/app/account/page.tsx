import Account from './account'
import { fetchPublicEnv } from '@/classes/PublicEnv'

const env = fetchPublicEnv()

export default async function Page() {
  return <Account env={env} />
}
