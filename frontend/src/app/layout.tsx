import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ToastContainer from '@/components/ui/Toast'

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
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  )
}
