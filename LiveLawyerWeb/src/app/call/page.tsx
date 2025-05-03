import { BACKEND_URL } from 'livelawyerlibrary/env'
import { Call } from './call'

export default async function Page() {
  return <Call backendUrl={BACKEND_URL} />
}
