import type { Metadata } from 'next'
import { SWRProvider } from '@/providers/swr-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Data Room',
  description: 'Secure document management for due diligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  )
}
