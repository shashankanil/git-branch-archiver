import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'github-archiver',
  description: 'archive and tag your github repositories',
  generator: 'github-archiver',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
