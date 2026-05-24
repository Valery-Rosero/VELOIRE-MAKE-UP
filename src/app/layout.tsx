import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vèloire — Maquillaje',
  description: 'Tienda de maquillaje online. Encuentra tu tono perfecto entre nuestra colección artesanal.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
