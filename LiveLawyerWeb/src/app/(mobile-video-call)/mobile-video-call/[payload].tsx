import { useRouter } from 'next/router'
import { MobileWebViewCall } from './mobile-webview-call'

export default function Page() {
  const router = useRouter()

  return <MobileWebViewCall payload={router.query.token as string} />
}
