import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'FinDash — Market Dashboard',
  description: 'Personal financial market dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f4f4f8] text-gray-900 dark:bg-[#0a0a0f] dark:text-gray-100 min-h-screen">
        <Providers>
          <Header />
          <main className="max-w-[1600px] mx-auto px-6 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
