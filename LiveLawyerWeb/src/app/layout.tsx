import 'bootstrap/dist/css/bootstrap.min.css'
import { ContextManager } from 'livelawyerlibrary/context-manager'
import LiveLawyerNav from '@/components/LiveLawyerNav'
import SessionlessMenu from '@/components/sessionless/SessionlessMenu'
import { BACKEND_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from 'livelawyerlibrary/env'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Live Lawyer Web',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ContextManager
          env={{
            supabaseUrl: SUPABASE_URL,
            supabaseAnonKey: SUPABASE_ANON_KEY,
            backendUrl: BACKEND_URL,
          }}
          loadingComponent={<p>Loading...</p>}
          sessionlessComponent={<SessionlessMenu />}
        >
          <LiveLawyerNav />
          {children}
        </ContextManager>
      </body>
    </html>
  )
}
