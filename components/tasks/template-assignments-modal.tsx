'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Plus, Trash2, MapPin, Users, Loader2 } from 'lucide-react'

interface ClientPDV {
  id: string
  pdvMaster: {
    name: string
    address: string
  }
}

interface Agent {
  id: string
  user: {
    name: string
    email: string
  }
  territory: string
}

interface Assignment {
  id: string
  pdvId?: string
  agentId?: string
  isActive: boolean
}

interface TemplateAssignmentsModalProps {
  isOpen: boolean
  onClose: () => void
  template: {
    id: string
    name: string
    type: string
  }
}

export default function TemplateAssignmentsModal({
  isOpen,
  onClose,
  template
}: TemplateAssignmentsModalProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [pdvs, setPdvs] = useState<ClientPDV[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, template.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // En un proyecto real, estos serían llamadas a APIs separadas
      // Por ahora simulamos datos
      setPdvs([
        {
          id: 'pdv1',
          pdvMaster: {
            name: 'Supermercado Central',
            address: 'Av. Principal 123'
          }
        },
        {
          id: 'pdv2',
          pdvMaster: {
            name: 'Tienda del Barrio',
            address: 'Calle Secundaria 456'
          }
        }
      ])

      setAgents([
        {
          id: 'agent1',
          user: {
            name: 'Juan Pérez',
            email: 'juan@empresa.com'
          },
          territory: 'Zona Norte'
        },
        {
          id: 'agent2',
          user: {
            name: 'María García',
            email: 'maria@empresa.com'
          },
          territory: 'Zona Sur'
        }
      ])

      setAssignments([])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAssignment = () => {
    setAssignments(prev => [...prev, {
      id: `temp-${Date.now()}`,
      isActive: true
    }])
  }

  const updateAssignment = (id: string, field: keyof Assignment, value: any) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === id ? { ...assignment, [field]: value } : assignment
    ))
  }

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Aquí iría la lógica para guardar las asignaciones
      console.log('Saving assignments:', assignments)
      onClose()
    } catch (error) {
      console.error('Error saving assignments:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Gestionar Asignaciones - {template.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Asignaciones de la plantilla</h3>
                  <p className="text-sm text-gray-600">
                    Define qué PDVs y agentes pueden usar esta plantilla
                  </p>
                </div>
                <Button onClick={addAssignment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Asignación
                </Button>
              </div>

              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay asignaciones configuradas</p>
                    <p className="text-sm">Agrega asignaciones para definir el alcance de la plantilla</p>
                  </div>
                ) : (
                  assignments.map((assignment, index) => (
                    <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Asignación {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">PDV (Opcional)</label>
                          <select
                            value={assignment.pdvId || ''}
                            onChange={(e) => updateAssignment(assignment.id, 'pdvId', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Todos los PDVs</option>
                            {pdvs.map(pdv => (
                              <option key={pdv.id} value={pdv.id}>
                                {pdv.pdvMaster.name} - {pdv.pdvMaster.address}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Agente (Opcional)</label>
                          <select
                            value={assignment.agentId || ''}
                            onChange={(e) => updateAssignment(assignment.id, 'agentId', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Todos los agentes</option>
                            {agents.map(agent => (
                              <option key={agent.id} value={agent.id}>
                                {agent.user.name} - {agent.territory}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`active-${assignment.id}`}
                          checked={assignment.isActive}
                          onChange={(e) => updateAssignment(assignment.id, 'isActive', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`active-${assignment.id}`} className="text-sm">
                          Asignación activa
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar Asignaciones
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
