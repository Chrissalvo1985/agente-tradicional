import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  DollarSign,
  Activity,
  Users
} from 'lucide-react'

export function StatsGrid() {
  const stats = [
    {
      title: 'Visitas Hoy',
      value: '12',
      change: '+8%',
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Tareas Completadas',
      value: '8/12',
      change: '67%',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Precios Auditados',
      value: '156',
      change: '+24',
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950'
    },
    {
      title: 'Puntos Fidelización',
      value: '2,340',
      change: '+12%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Eficiencia',
      value: '94%',
      change: '+5%',
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950'
    },
    {
      title: 'PDV Activos',
      value: '45',
      change: '+3',
      icon: Users,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold">{stat.value}</p>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
