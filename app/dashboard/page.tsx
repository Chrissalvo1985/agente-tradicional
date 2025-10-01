import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {session.user.name?.split(' ')[0] || 'Agente'}
        </h1>
        <p className="text-muted-foreground">
          Aquí está tu resumen del día
        </p>
      </div>

      <StatsGrid />
      
      <RecentActivity />
    </main>
  )
}
