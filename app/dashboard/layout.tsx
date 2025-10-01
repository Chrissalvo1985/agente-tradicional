import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader user={session.user} />
      {children}
    </div>
  )
}

