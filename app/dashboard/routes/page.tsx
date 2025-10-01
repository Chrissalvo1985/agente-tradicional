'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGeolocation } from '@/hooks/use-geolocation'
import { TaskExecutionModal } from '@/components/tasks/task-execution-modal'
import { SKUPriceTask } from '@/components/tasks/sku-price-task'
import { ChecklistTask } from '@/components/tasks/checklist-task'
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Loader2,
  LogIn,
  LogOut as LogOutIcon
} from 'lucide-react'
import { calculateDistance } from '@/lib/utils'

export default function RoutesPage() {
  const { position, loading: geoLoading, error: geoError } = useGeolocation()
  const [selectedPDV, setSelectedPDV] = useState<string | null>(null)
  const [showTasksModal, setShowTasksModal] = useState(false)
  const [currentPDV, setCurrentPDV] = useState<any>(null)
  const [activeTask, setActiveTask] = useState<any>(null)
  const [taskType, setTaskType] = useState<'PRICE_AUDIT_SKU' | 'EXHIBITION_CHECKLIST' | null>(null)

  // Mock data - esto vendría de la API
  const mockPDVs = [
    {
      id: '1',
      name: 'Almacén El Sol',
      address: 'Av. Principal 123',
      latitude: -33.4489,
      longitude: -70.6693,
      type: 'pdv' as const,
      status: 'pending',
      priority: 1
    },
    {
      id: '2',
      name: 'Minimarket Central',
      address: 'Calle Central 456',
      latitude: -33.4520,
      longitude: -70.6650,
      type: 'pdv' as const,
      status: 'pending',
      priority: 2
    },
    {
      id: '3',
      name: 'Almacén La Esquina',
      address: 'Av. Las Rosas 789',
      latitude: -33.4450,
      longitude: -70.6720,
      type: 'completed' as const,
      status: 'completed',
      priority: 3
    }
  ]

  // Mock tasks data
  const mockTasksForPDV = {
    '1': [
      {
        id: 't1',
        type: 'PRICE_AUDIT_SKU' as const,
        templateName: 'Auditoría Coca-Cola',
        itemsCount: 12,
        status: 'PENDING' as const
      },
      {
        id: 't2',
        type: 'EXHIBITION_CHECKLIST' as const,
        templateName: 'Checklist Exhibición Verano',
        itemsCount: 8,
        status: 'PENDING' as const
      }
    ],
    '2': [
      {
        id: 't3',
        type: 'PRICE_AUDIT_SKU' as const,
        templateName: 'Precios Competencia',
        itemsCount: 20,
        status: 'PENDING' as const
      }
    ],
    '3': []
  }

  // Mock SKU items
  const mockSKUItems = [
    { id: 's1', sku: 'CC-001', name: 'Coca Cola 500ml', brand: 'Coca-Cola', targetPrice: 1200, category: 'Bebidas' },
    { id: 's2', sku: 'CC-002', name: 'Coca Cola 1.5L', brand: 'Coca-Cola', targetPrice: 2100, category: 'Bebidas' },
    { id: 's3', sku: 'CC-003', name: 'Sprite 500ml', brand: 'Coca-Cola', targetPrice: 1150, category: 'Bebidas' },
  ]

  // Mock checklist items
  const mockChecklistItems = [
    { id: 'c1', name: 'Exhibición de Verano Instalada', description: 'Verificar que la exhibición esté correctamente instalada', requiresPhoto: true, isRequired: true, order: 1 },
    { id: 'c2', name: 'Material POP Colocado', description: 'Verificar material publicitario en punto de venta', requiresPhoto: true, isRequired: true, order: 2 },
    { id: 'c3', name: 'Productos en Góndola', description: 'Verificar productos destacados en góndola', requiresPhoto: true, isRequired: false, order: 3 },
  ]

  const handleCheckIn = (pdvId: string) => {
    const pdv = mockPDVs.find(p => p.id === pdvId)
    if (pdv) {
      setCurrentPDV(pdv)
      setShowTasksModal(true)
    }
  }

  const handleCheckOut = (pdvId: string) => {
    console.log('Check-out from PDV:', pdvId)
    // Implementar lógica de check-out
  }

  const handleSelectTask = (task: any) => {
    setActiveTask(task)
    setTaskType(task.type)
    setShowTasksModal(false)
  }

  const handleTaskComplete = (data: any) => {
    console.log('Task completed:', data)
    // Aquí se guardaría en la BD
    setActiveTask(null)
    setTaskType(null)
    setCurrentPDV(null)
  }

  const handleTaskCancel = () => {
    setActiveTask(null)
    setTaskType(null)
    if (currentPDV) {
      setShowTasksModal(true)
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Rutas del Día</h1>
          <p className="text-muted-foreground">
            Gestiona tus visitas y optimiza tu ruta
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total PDV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockPDVs.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {mockPDVs.filter(p => p.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {mockPDVs.filter(p => p.status === 'pending').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Distancia Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8.4 km</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de PDVs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Puntos de Venta</h2>
              <p className="text-sm text-muted-foreground">
                {geoLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Obteniendo ubicación...
                  </span>
                ) : geoError ? (
                  <span className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Error de ubicación
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-green-600">
                    <Navigation className="h-3 w-3" />
                    Ubicación activa
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {mockPDVs.map((pdv) => {
                  const distance = position 
                    ? calculateDistance(
                        position.latitude,
                        position.longitude,
                        pdv.latitude,
                        pdv.longitude
                      )
                    : null

                  return (
                    <Card 
                      key={pdv.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPDV === pdv.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPDV(pdv.id)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{pdv.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {pdv.address}
                            </p>
                          </div>
                          {pdv.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          )}
                        </div>

                        {distance && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {distance.toFixed(2)} km de distancia
                          </p>
                        )}

                        {pdv.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCheckIn(pdv.id)
                              }}
                            >
                              <LogIn className="h-3 w-3 mr-1" />
                              Check-in
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${pdv.latitude},${pdv.longitude}`)
                              }}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Navegar
                            </Button>
                          </div>
                        )}

                        {pdv.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="w-full"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completado
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
          </div>
        </div>

      {/* Task Execution Modal */}
      {currentPDV && (
        <TaskExecutionModal
          pdvName={currentPDV.name}
          tasks={mockTasksForPDV[currentPDV.id as keyof typeof mockTasksForPDV] || []}
          isOpen={showTasksModal}
          onClose={() => {
            setShowTasksModal(false)
            setCurrentPDV(null)
          }}
          onSelectTask={handleSelectTask}
        />
      )}

      {/* SKU Price Task */}
      {taskType === 'PRICE_AUDIT_SKU' && activeTask && (
        <SKUPriceTask
          templateName={activeTask.templateName}
          skuItems={mockSKUItems}
          onComplete={handleTaskComplete}
          onCancel={handleTaskCancel}
        />
      )}

      {/* Checklist Task */}
      {taskType === 'EXHIBITION_CHECKLIST' && activeTask && (
        <ChecklistTask
          templateName={activeTask.templateName}
          items={mockChecklistItems}
          onComplete={handleTaskComplete}
          onCancel={handleTaskCancel}
        />
      )}
    </main>
  )
}
