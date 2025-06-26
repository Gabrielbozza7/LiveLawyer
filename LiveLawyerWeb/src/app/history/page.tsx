import { ContextManager } from '@/components/ContextManager'
import { History } from './history'
import { fetchPublicEnv } from '@/classes/PublicEnv'
import SessionlessMenu from '@/components/sessionless/SessionlessMenu'
import LiveLawyerNav from '@/components/LiveLawyerNav'

const env = fetchPublicEnv()

export default async function Page() {
  return (
    <ContextManager env={env} sessionlessComponent={<SessionlessMenu />}>
      <LiveLawyerNav />
      <History />
    </ContextManager>
  )
}
