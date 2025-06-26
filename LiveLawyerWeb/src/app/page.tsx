import { ContextManager } from '@/components/ContextManager'
import { fetchPublicEnv } from '@/classes/PublicEnv'
import SessionlessMenu from '@/components/sessionless/SessionlessMenu'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import Landing from './landing'

const env = fetchPublicEnv()

export default async function Page() {
  return (
    <ContextManager env={env} sessionlessComponent={<SessionlessMenu />}>
      <LiveLawyerNav />
      <Landing />
    </ContextManager>
  )
}
