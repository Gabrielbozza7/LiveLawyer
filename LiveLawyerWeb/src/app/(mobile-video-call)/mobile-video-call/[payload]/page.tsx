import { MobileWebViewCall } from './mobile-webview-call'

interface PageProps {
  params: { payload: string }
}

export default function Page({ params }: PageProps) {
  return <MobileWebViewCall payload={params.payload} />
}
