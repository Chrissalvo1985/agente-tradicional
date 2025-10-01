'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Settings,
  ClipboardList,
  Users,
  Package,
  Bell,
  Shield,
  Database,
  Palette,
  ChevronRight,
  Wrench,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: any
  href: string
  badge?: string
  color: string
  bgColor: string
}

export default function SettingsPage() {
  const settingSections: SettingSection[] = [
    {
      id: 'clients',
      title: 'Clientes',
      description: 'Administrar clientes y sus configuraciones',
      icon: Users,
      href: '/dashboard/settings/clients',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      id: 'users',
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema y asignar roles',
      icon: Shield,
      href: '/dashboard/settings/users',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      id: 'pdv-master',
      title: 'Maestra de PDVs',
      description: 'Catálogo global de puntos de venta',
      icon: Database,
      href: '/dashboard/settings/pdv-master',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      id: 'routes',
      title: 'Asignación de Rutas',
      description: 'Asignar tareas a PDVs, agentes y programar visitas',
      icon: MapPin,
      href: '/dashboard/settings/routes',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950'
    },
    {
      id: 'tasks',
      title: 'Gestión de Tareas',
      description: 'Configurar plantillas de tareas, SKUs y asignaciones a PDVs',
      icon: ClipboardList,
      href: '/dashboard/settings/tasks',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950'
    },
    {
      id: 'products',
      title: 'Productos y SKUs',
      description: 'Administrar catálogo de productos, categorías y precios objetivo',
      icon: Package,
      href: '/dashboard/settings/products',
      badge: 'Próximamente',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configurar alertas, recordatorios y notificaciones push',
      icon: Bell,
      href: '/dashboard/settings/notifications',
      badge: 'Próximamente',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950'
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      description: 'Personalizar tema, colores y preferencias visuales',
      icon: Palette,
      href: '/dashboard/settings/appearance',
      badge: 'Próximamente',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950'
    },
    {
      id: 'system',
      title: 'Sistema',
      description: 'Configuración general del sistema, logs y mantenimiento',
      icon: Wrench,
      href: '/dashboard/settings/system',
      badge: 'Próximamente',
      color: 'text-zinc-600',
      bgColor: 'bg-zinc-50 dark:bg-zinc-950'
    }
  ]

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">
              Administra todos los aspectos del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingSections.map((section) => {
          const Icon = section.icon
          const isDisabled = section.badge === 'Próximamente'
          
          return (
            <Link
              key={section.id}
              href={isDisabled ? '#' : section.href}
              className={`group ${isDisabled ? 'cursor-not-allowed' : ''}`}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              <Card className={`h-full transition-all hover:shadow-md ${
                isDisabled 
                  ? 'opacity-60' 
                  : 'hover:border-primary cursor-pointer'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${section.bgColor} flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{section.title}</h3>
                          {section.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {section.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    {!isDisabled && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Versión del Sistema</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Última Actualización</span>
            <span className="font-medium">Octubre 2025</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estado del Sistema</span>
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-medium text-green-600">Operativo</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

