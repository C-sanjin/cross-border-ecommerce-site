import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ToastContainer from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: {
    default: 'The Boutique - Cross-Border Fashion',
    template: '%s - The Boutique',
  },
  description: 'Discover curated fashion from around the world. Premium cross-border ecommerce for contemporary style.',
  openGraph: {
    title: 'The Boutique - Cross-Border Fashion',
    description: 'Discover curated fashion from around the world.',
    type: 'website',
    locale: 'en_US',
    siteName: 'The Boutique',
  },
  twitter: {
    card: 'summary_large_image',
  },
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
