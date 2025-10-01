'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Settings, 
  Gift, 
  AlertCircle,
  BarChart3,
  Users,
  X,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Rutas',
    href: '/dashboard/routes',
    icon: MapPin
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings
  },
  {
    title: 'Fidelización',
    href: '/dashboard/loyalty',
    icon: Gift
  },
  {
    title: 'Incidencias',
    href: '/dashboard/incidents',
    icon: AlertCircle
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3
  },
  {
    title: 'PDV',
    href: '/dashboard/pdvs',
    icon: Users
  }
]

export function MobileNavigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-white">AT</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Agente Tradicional</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2 bg-white dark:bg-zinc-950">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export function DesktopNavigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
