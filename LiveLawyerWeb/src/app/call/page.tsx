import { BACKEND_URL } from 'livelawyerlibrary'
import { Call } from './call'

export default async function Page() {
  return <Call backendUrl={BACKEND_URL}></Call>
}
