import type { Metadata } from 'next'
import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: 'HSKWise',
  description: 'Professional HSK preparation for Chinese learners.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
