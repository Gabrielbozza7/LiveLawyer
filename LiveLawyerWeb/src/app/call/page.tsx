import { Call } from './call'
import { fetchPublicEnv } from '@/classes/PublicEnv'

const env = fetchPublicEnv()

export default async function Page() {
  return <Call env={env} />
}
