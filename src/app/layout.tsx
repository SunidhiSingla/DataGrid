
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'
import './globals.css';
 
export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}