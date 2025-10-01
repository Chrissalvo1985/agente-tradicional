'use client'

import { useState } from 'react'
import { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, Bell } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { MobileNavigation, DesktopNavigation } from './navigation'

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white">AT</span>
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold">Agente Tradicional</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            <div className="hidden sm:flex items-center gap-3 pl-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {getInitials(user.name || 'User')}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  )
}
