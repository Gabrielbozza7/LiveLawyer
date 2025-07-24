import './global.css'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import type { Metadata } from 'next'
import CssBaseline from '@mui/material/CssBaseline'

export const metadata: Metadata = {
  description: 'Live Lawyer Web',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <CssBaseline>{children}</CssBaseline>
    </html>
  )
}
