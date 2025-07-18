import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import CssBaseline from '@mui/material/CssBaseline'
import { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Mobile Video Call (WebView)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <CssBaseline>
        <body style={{ backgroundColor: '#DDEEFF' }}>{children}</body>
      </CssBaseline>
    </html>
  )
}
