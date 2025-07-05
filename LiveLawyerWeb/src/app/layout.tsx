import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { ContextManager } from 'livelawyerlibrary/context-manager'
import LoginRegister from '@/components/auth/login-register'
import { BACKEND_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from 'livelawyerlibrary/env'
import type { Metadata } from 'next'
import CompleteRegistration from '@/components/auth/complete-registration'
import LiveLawyerNav from '@/components/LiveLawyerNav'

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
          sessionlessComponent={<LoginRegister />}
          uninitializedUserComponent={<CompleteRegistration />}
        >
          <LiveLawyerNav />
          {children}
        </ContextManager>
      </body>
    </html>
  )
}
