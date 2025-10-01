'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Store,
  ClipboardList,
  ChevronRight,
  CheckCircle2,
  Edit,
  Trash2,
  Filter,
  Loader2,
  FileSpreadsheet
} from 'lucide-react'
import Link from 'next/link'
import ExcelImport from '@/components/import/excel-import'
import Pagination from '@/components/ui/pagination'

interface RouteAssignment {
  id: string
  clientId: string
  clientName: string
  pdvId: string
  pdvName: string
  agentId: string
  agentName: string
  tasksCount: number
  scheduledDate: string
  scheduledTime: string
  status: 'PROGRAMADA' | 'EN_CURSO' | 'COMPLETADA'
}

interface Client {
  id: string
  name: string
}

interface Agent {
  id: string
  name: string
  clientId: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function RouteAssignmentPage() {
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<RouteAssignment | null>(null)
  const [selectedClient, setSelectedClient] = useState('')
  const [filterClient, setFilterClient] = useState<string>('ALL')
  const [assignments, setAssignments] = useState<RouteAssignment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [formData, setFormData] = useState({
    clientId: '',
    agentId: '',
    scheduledDate: '',
    scheduledTime: '09:00'
  })

  useEffect(() => {
    fetchAssignments()
    fetchClients()
    fetchAgents()
  }, [])

  const fetchAssignments = async (page: number = pagination.page, limit: number = pagination.limit) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (filterClient !== 'ALL') {
        params.append('clientId', filterClient)
      }

      const response = await fetch(`/api/route-assignments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (response.ok) {
        const data = await response.json()
        setAgents(data)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  const handlePageChange = (page: number) => {
    fetchAssignments(page, pagination.limit)
  }

  const handleFilterChange = (clientId: string) => {
    setFilterClient(clientId)
    fetchAssignments(1, pagination.limit) // Reset to page 1 when filtering
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROGRAMADA':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'EN_CURSO':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      case 'COMPLETADA':
        return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
      default:
        return 'bg-zinc-50 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300'
    }
  }

  const handleEdit = (assignment: RouteAssignment) => {
    setEditingAssignment(assignment)
    setFormData({
      clientId: assignment.clientId,
      agentId: assignment.agentId,
      scheduledDate: assignment.scheduledDate,
      scheduledTime: assignment.scheduledTime
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingAssignment) return

    if (!formData.clientId || !formData.agentId || !formData.scheduledDate) {
      alert('Cliente, agente y fecha son requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/route-assignments/${editingAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          agentId: formData.agentId,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime
        })
      })

      if (response.ok) {
        await fetchAssignments()
        setShowEditModal(false)
        setEditingAssignment(null)
        setFormData({ clientId: '', agentId: '', scheduledDate: '', scheduledTime: '09:00' })
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al actualizar asignación')
      }
    } catch (error) {
      console.error('Error updating assignment:', error)
      alert('Error al actualizar asignación')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (assignment: RouteAssignment) => {
    if (confirm(`¿Eliminar asignación para ${assignment.pdvName}?`)) {
      setAssignments(assignments.filter(a => a.id !== assignment.id))
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asignación de Rutas</h1>
            <p className="text-muted-foreground">
              Asigna tareas a PDVs, agentes y programa visitas
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => setShowImportModal(true)}
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Importar Excel
          </Button>
          <Button 
            size="lg"
            onClick={() => setShowCreateFlow(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nueva Asignación
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Asignaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assignments.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {assignments.filter(a => a.status === 'PROGRAMADA').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {assignments.filter(a => a.status === 'EN_CURSO').length}
            </p>
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
              {assignments.filter(a => a.status === 'COMPLETADA').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por cliente:</span>
              <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterClient === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('ALL')}
              >
                Todos
              </Button>
              {clients.map(client => (
                <Button
                  key={client.id}
                  variant={filterClient === client.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(client.id)}
                >
                  {client.name}
                </Button>
              ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Elementos por página:</span>
              <select 
                value={pagination.limit}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value)
                  fetchAssignments(1, newLimit)
                }}
                className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Asignación</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Agente</th>
                  <th className="text-center p-4 font-medium">Tareas</th>
                  <th className="text-center p-4 font-medium">Fecha</th>
                  <th className="text-center p-4 font-medium">Hora</th>
                  <th className="text-center p-4 font-medium">Estado</th>
                  <th className="text-center p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium">{assignment.pdvName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{assignment.clientName}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{assignment.agentName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <ClipboardList className="h-3 w-3" />
                        {assignment.tasksCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(assignment.scheduledDate).toLocaleDateString('es-CL')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{assignment.scheduledTime}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(assignment)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(assignment)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginación */}
      {!loading && assignments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} asignaciones
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {!loading && assignments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No hay asignaciones</p>
              <p className="text-sm text-muted-foreground mb-4">
                {filterClient !== 'ALL' 
                  ? 'No hay asignaciones para este cliente' 
                  : 'Crea la primera asignación de ruta'}
              </p>
              <Button onClick={() => setShowCreateFlow(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Asignación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAssignment && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editar Asignación</CardTitle>
              <CardDescription>
                Modifica la información de la asignación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cliente *</label>
                  <select 
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Agente *</label>
                  <select 
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar agente...</option>
                    {agents
                      .filter(agent => !formData.clientId || agent.clientId === formData.clientId)
                      .map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha Programada *</label>
                  <input 
                    type="date" 
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hora Programada</label>
                  <input 
                    type="time" 
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingAssignment(null)
                      setFormData({ clientId: '', agentId: '', scheduledDate: '', scheduledTime: '09:00' })
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleUpdate}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Asignación'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Importar Planificaciones desde Excel</CardTitle>
              <CardDescription>
                Importa múltiples planificaciones de rutas desde un archivo Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImport 
                type="route-assignments"
                onImportComplete={() => {
                  setShowImportModal(false)
                }}
                onRefresh={fetchAssignments}
              />
              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Assignment Flow */}
      {showCreateFlow && (
        <AssignmentFlowModal
          onClose={() => setShowCreateFlow(false)}
          onComplete={(data) => {
            console.log('Nueva asignación:', data)
            setShowCreateFlow(false)
          }}
        />
      )}
    </main>
  )
}

// Modal de flujo de creación
interface AssignmentFlowModalProps {
  onClose: () => void
  onComplete: (data: any) => void
}

function AssignmentFlowModal({ onClose, onComplete }: AssignmentFlowModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    clientId: '',
    pdvId: '',
    tasks: [] as string[],
    agentId: '',
    date: '',
    time: ''
  })

  // Mock data
  const clients = [
    { id: '1', name: 'Coca-Cola Chile' },
    { id: '2', name: 'PepsiCo' }
  ]

  const pdvs = [
    { id: '1', name: 'Almacén El Sol', address: 'Av. Principal 123' },
    { id: '2', name: 'Minimarket Central', address: 'Calle Central 456' },
    { id: '3', name: 'Almacén La Esquina', address: 'Av. Las Rosas 789' }
  ]

  const tasks = [
    { id: 't1', name: 'Auditoría Precios Coca-Cola', type: 'PRICE_AUDIT_SKU' },
    { id: 't2', name: 'Checklist Exhibición Verano', type: 'EXHIBITION_CHECKLIST' },
    { id: 't3', name: 'Fidelización Almacenero', type: 'LOYALTY_ENROLLMENT' }
  ]

  const agents = [
    { id: 'a1', name: 'Juan Pérez', email: 'juan@cocacola.com' },
    { id: 'a2', name: 'María González', email: 'maria@cocacola.com' },
    { id: 'a3', name: 'Carlos Muñoz', email: 'carlos@cocacola.com' }
  ]

  const handleNext = () => {
    if (step === 1 && !formData.clientId) {
      alert('Selecciona un cliente')
      return
    }
    if (step === 2 && !formData.pdvId) {
      alert('Selecciona un PDV')
      return
    }
    if (step === 3 && formData.tasks.length === 0) {
      alert('Selecciona al menos una tarea')
      return
    }
    if (step === 4 && !formData.agentId) {
      alert('Selecciona un agente')
      return
    }
    if (step === 5 && (!formData.date || !formData.time)) {
      alert('Completa fecha y hora')
      return
    }
    
    if (step < 5) {
      setStep(step + 1)
    } else {
      onComplete(formData)
    }
  }

  const toggleTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.includes(taskId)
        ? prev.tasks.filter(t => t !== taskId)
        : [...prev.tasks, taskId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nueva Asignación de Ruta</CardTitle>
              <CardDescription>Paso {step} de 5</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Seleccionar Cliente */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Seleccionar Cliente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Elige el cliente para esta asignación
                </p>
              </div>
              <div className="grid gap-3">
                {clients.map(client => (
                  <Card
                    key={client.id}
                    className={`cursor-pointer transition-all ${
                      formData.clientId === client.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData({ ...formData, clientId: client.id })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium">{client.name}</span>
                      {formData.clientId === client.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Seleccionar PDV */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Seleccionar PDV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Elige el punto de venta a visitar
                </p>
              </div>
              <div className="grid gap-3">
                {pdvs.map(pdv => (
                  <Card
                    key={pdv.id}
                    className={`cursor-pointer transition-all ${
                      formData.pdvId === pdv.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData({ ...formData, pdvId: pdv.id })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pdv.name}</p>
                        <p className="text-sm text-muted-foreground">{pdv.address}</p>
                      </div>
                      {formData.pdvId === pdv.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Asignar Tareas */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Asignar Tareas al PDV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona las tareas que debe realizar el agente (múltiple selección)
                </p>
              </div>
              <div className="grid gap-3">
                {tasks.map(task => {
                  const isSelected = formData.tasks.includes(task.id)
                  return (
                    <Card
                      key={task.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-muted-foreground">{task.type}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.tasks.length} tarea(s) seleccionada(s)
              </p>
            </div>
          )}

          {/* Step 4: Asignar Agente */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">4. Asignar Agente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Elige el agente que realizará la visita
                </p>
              </div>
              <div className="grid gap-3">
                {agents.map(agent => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all ${
                      formData.agentId === agent.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData({ ...formData, agentId: agent.id })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                      {formData.agentId === agent.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Programar Visita */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">5. Programar Visita</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define la fecha y hora de la visita
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hora</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-muted/50 mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Resumen de Asignación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">
                      {clients.find(c => c.id === formData.clientId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PDV:</span>
                    <span className="font-medium">
                      {pdvs.find(p => p.id === formData.pdvId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tareas:</span>
                    <span className="font-medium">{formData.tasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agente:</span>
                    <span className="font-medium">
                      {agents.find(a => a.id === formData.agentId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">
                      {formData.date ? new Date(formData.date).toLocaleDateString('es-CL') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora:</span>
                    <span className="font-medium">{formData.time || '-'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-6 mt-6 border-t">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
              >
                Atrás
              </Button>
            )}
            <div className="flex-1" />
            <Button onClick={handleNext}>
              {step < 5 ? (
                <>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Crear Asignación
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

