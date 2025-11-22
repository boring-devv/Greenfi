import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GreenFi - Stake Green, Earn Impact',
  description: 'Stake your HBAR to fund verified climate projects and earn traceable impact NFTs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
