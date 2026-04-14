import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFF8F0',
}

export const metadata: Metadata = {
  title: 'Retirement Calculator — Find Your Freedom Number',
  description: 'Find out exactly how much money you need saved to retire forever. No jargon, no complicated math — just your number.',
  openGraph: {
    title: 'Retirement Calculator — Find Your Freedom Number',
    description: 'Find out how much you need to retire forever. Takes 2 minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
