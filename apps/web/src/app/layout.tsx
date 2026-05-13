import type { Metadata } from 'next'
import { AppProviders } from './providers'

export const metadata: Metadata = {
  title: 'Goods Tracker',
  description: 'Multitenant goods tracking',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
