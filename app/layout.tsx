import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'France Trip Planner 2026',
  description: '프랑스 여행을 위한 올인원 플래너',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()
  return (
    <html lang="ko">
      <body>
        <Navbar user={user} />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
