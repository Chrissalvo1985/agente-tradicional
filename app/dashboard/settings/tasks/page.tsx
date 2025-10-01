'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Settings,
  ClipboardList,
  Tag,
  Users,
  MapPin,
  Trash2,
  Edit,
  Copy,
  ChevronLeft,
  ArrowLeft,
  Loader2,
  Power,
  PowerOff
} from 'lucide-react'
import Link from 'next/link'
import TaskTemplateModal from '@/components/tasks/task-template-modal'
import TemplateAssignmentsModal from '@/components/tasks/template-assignments-modal'

type TemplateType = 'PRICE_AUDIT_SKU' | 'EXHIBITION_CHECKLIST'

interface Template {
  id: string
  name: string
  description: string
  type: TemplateType
  itemsCount: number
  assignmentsCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}


export default function TasksConfigPage() {
  const [selectedType, setSelectedType] = useState<TemplateType | 'ALL'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false)
  const [selectedTemplateForAssignments, setSelectedTemplateForAssignments] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/task-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }


  const filteredTemplates = selectedType === 'ALL' 
    ? templates 
    : templates.filter(t => t.type === selectedType)

  const getTypeLabel = (type: TemplateType) => {
    return type === 'PRICE_AUDIT_SKU' ? 'Precios por SKU' : 'Checklist Exhibición'
  }

  const getTypeColor = (type: TemplateType) => {
    return type === 'PRICE_AUDIT_SKU' 
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setShowCreateModal(true)
  }

  const handleDuplicate = async (template: Template) => {
    try {
      const response = await fetch('/api/task-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${template.name} (Copia)`,
          description: template.description,
          type: template.type,
          items: [] // Los items se cargarán desde la plantilla original
        })
      })

      if (response.ok) {
        fetchTemplates()
        alert('Plantilla duplicada correctamente')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Error al duplicar la plantilla')
    }
  }

  const handleManageAssignments = (template: Template) => {
    setSelectedTemplateForAssignments(template)
    setShowAssignmentsModal(true)
  }

  const handleDelete = async (template: Template) => {
    if (confirm(`¿Estás seguro de eliminar la plantilla "${template.name}"?`)) {
      try {
        const response = await fetch(`/api/task-templates/${template.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchTemplates()
          alert('Plantilla eliminada correctamente')
        } else {
          const error = await response.json()
          alert(`Error: ${error.error}`)
        }
      } catch (error) {
        alert('Error al eliminar la plantilla')
      }
    }
  }

  const handleToggleActive = async (template: Template) => {
    try {
      const response = await fetch(`/api/task-templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !template.isActive
        })
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Error al actualizar el estado de la plantilla')
    }
  }

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const url = editingTemplate 
        ? `/api/task-templates/${editingTemplate.id}`
        : '/api/task-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      })

      if (response.ok) {
        fetchTemplates()
        setEditingTemplate(null)
        setShowCreateModal(false)
        alert(editingTemplate ? 'Plantilla actualizada correctamente' : 'Plantilla creada correctamente')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar la plantilla')
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Configuración de Tareas
              </h1>
              <p className="text-muted-foreground">
                Administra plantillas, SKUs y asignaciones de tareas
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          size="lg"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Nueva Plantilla
        </Button>
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
              Plantillas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {templates.filter(t => t.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SKUs Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {templates.reduce((acc, t) => t.type === 'PRICE_AUDIT_SKU' ? acc + t.itemsCount : acc, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {templates.reduce((acc, t) => t.type === 'EXHIBITION_CHECKLIST' ? acc + t.itemsCount : acc, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asignaciones Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {templates.reduce((acc, t) => acc + t.assignmentsCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedType('ALL')}
            >
              Todas
            </Button>
            <Button
              variant={selectedType === 'PRICE_AUDIT_SKU' ? 'default' : 'outline'}
              onClick={() => setSelectedType('PRICE_AUDIT_SKU')}
            >
              <Tag className="mr-2 h-4 w-4" />
              Precios por SKU
            </Button>
            <Button
              variant={selectedType === 'EXHIBITION_CHECKLIST' ? 'default' : 'outline'}
              onClick={() => setSelectedType('EXHIBITION_CHECKLIST')}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Checklist Exhibición
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Plantilla</th>
                  <th className="text-left p-4 font-medium">Descripción</th>
                  <th className="text-center p-4 font-medium">Tipo</th>
                  <th className="text-center p-4 font-medium">Items</th>
                  <th className="text-center p-4 font-medium">Asignaciones</th>
                  <th className="text-center p-4 font-medium">Estado</th>
                  <th className="text-center p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          {template.type === 'PRICE_AUDIT_SKU' ? (
                            <Tag className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ClipboardList className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {template.description}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                        {getTypeLabel(template.type)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Settings className="h-3 w-3" />
                        {template.itemsCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Users className="h-3 w-3" />
                        {template.assignmentsCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        <div className={`h-2 w-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-zinc-400'}`} />
                        {template.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Editar"
                          onClick={() => handleEdit(template)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Duplicar"
                          onClick={() => handleDuplicate(template)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Gestionar Asignaciones"
                          onClick={() => handleManageAssignments(template)}
                          className="h-8 w-8"
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title={template.isActive ? "Desactivar" : "Activar"}
                          onClick={() => handleToggleActive(template)}
                          className={`h-8 w-8 ${template.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {template.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Eliminar"
                          onClick={() => handleDelete(template)}
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

      {!loading && filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No hay plantillas</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea una nueva plantilla para comenzar
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Modals */}
      <TaskTemplateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingTemplate(null)
        }}
        onSave={handleSaveTemplate}
        editingTemplate={editingTemplate}
      />

      <TemplateAssignmentsModal
        isOpen={showAssignmentsModal}
        onClose={() => {
          setShowAssignmentsModal(false)
          setSelectedTemplateForAssignments(null)
        }}
        template={selectedTemplateForAssignments || { id: '', name: '', type: '' }}
      />
    </main>
  )
}
