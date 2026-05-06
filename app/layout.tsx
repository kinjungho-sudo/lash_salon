import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MUTE EYELASH SALON',
  description: 'MUTE Eyelash Salon — 속눈썹펌 살롱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
