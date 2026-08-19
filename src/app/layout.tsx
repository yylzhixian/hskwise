import type { Metadata } from 'next'
import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: {
    default: 'HSKWise',
    template: '%s | HSKWise',
  },
  description: 'A focused, step-by-step path for learning Mandarin and preparing for HSK.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
