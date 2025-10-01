import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, MapPin, Camera, AlertCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'visit',
      title: 'Visita completada - Almacén El Sol',
      description: 'Levantamiento de precios y fidelización',
      time: new Date(Date.now() - 30 * 60 * 1000),
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'price',
      title: 'Auditoría de precios',
      description: '24 productos escaneados con IA',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: Camera,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'route',
      title: 'Ruta actualizada',
      description: 'Optimización automática de 5 PDV',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      icon: MapPin,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'incident',
      title: 'Incidencia reportada',
      description: 'Producto vencido en Minimarket Central',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: AlertCircle,
      color: 'text-amber-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex gap-4">
              <div className={`mt-1 p-2 rounded-lg bg-muted`}>
                <Icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(activity.time)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
