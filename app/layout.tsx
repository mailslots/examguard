import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Exaon — Secure Online Exams',
  description: 'A secure exam platform with anti-cheat detection for educators and students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
