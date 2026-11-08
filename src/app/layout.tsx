import type { Metadata } from 'next'
import { Anton, Public_Sans } from 'next/font/google'
import './globals.css'

const anton = Anton({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap',
  variable: '--font-anton',
})

const publicSans = Public_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-public-sans',
})

export const metadata: Metadata = {
  title: 'Kleinstadtsound | DJ Collective',
  description:
    'DJ Collective from Eichstätt - Electronic music, parties, and cultural events',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${anton.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
