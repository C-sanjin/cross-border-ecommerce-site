import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

export const metadata: Metadata = {
  title: 'minimog - Premium Fashion',
  description: 'Discover premium fashion essentials with worldwide delivery',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
