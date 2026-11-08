import type { Metadata } from 'next'
import { Anton, Public_Sans, Silkscreen } from 'next/font/google'
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

const silkscreen = Silkscreen({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap',
  variable: '--font-silkscreen',
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
    <html lang="de" className={`${anton.variable} ${publicSans.variable} ${silkscreen.variable}`}>
      <body>{children}</body>
    </html>
  )
}
