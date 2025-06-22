import { Landing } from './landing'
import { fetchPublicEnv } from '@/classes/PublicEnv'

const env = fetchPublicEnv()

export default async function Page() {
  return <Landing env={env} />
}
