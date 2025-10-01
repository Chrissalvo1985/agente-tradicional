'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  X,
  CheckCircle2,
  Tag,
  ClipboardList,
  ChevronRight,
  AlertCircle
} from 'lucide-react'

interface Task {
  id: string
  type: 'PRICE_AUDIT_SKU' | 'EXHIBITION_CHECKLIST'
  templateName: string
  itemsCount: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

interface TaskExecutionModalProps {
  pdvName: string
  tasks: Task[]
  isOpen: boolean
  onClose: () => void
  onSelectTask: (task: Task) => void
}

export function TaskExecutionModal({ 
  pdvName, 
  tasks, 
  isOpen, 
  onClose,
  onSelectTask
}: TaskExecutionModalProps) {
  if (!isOpen) return null

  const getTaskTypeLabel = (type: string) => {
    return type === 'PRICE_AUDIT_SKU' ? 'Precios por SKU' : 'Checklist Exhibición'
  }

  const getTaskTypeIcon = (type: string) => {
    return type === 'PRICE_AUDIT_SKU' ? Tag : ClipboardList
  }

  const getTaskTypeColor = (type: string) => {
    return type === 'PRICE_AUDIT_SKU'
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'IN_PROGRESS':
        return 'text-amber-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completada'
      case 'IN_PROGRESS':
        return 'En Progreso'
      default:
        return 'Pendiente'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-[9999]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Tareas para {pdvName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Selecciona una tarea para ejecutar
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No hay tareas asignadas</p>
              <p className="text-sm text-muted-foreground">
                Este PDV no tiene tareas configuradas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const Icon = getTaskTypeIcon(task.type)
                
                return (
                  <Card 
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => onSelectTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getTaskTypeColor(task.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{task.templateName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {task.itemsCount} items
                              </span>
                              <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                                {getStatusLabel(task.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {task.status === 'COMPLETED' && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

