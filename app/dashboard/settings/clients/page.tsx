'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Users,
  Edit,
  Trash2,
  ArrowLeft,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  FileSpreadsheet
} from 'lucide-react'
import Link from 'next/link'
import ExcelImport from '@/components/import/excel-import'

interface Client {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  pdvCount: number
  agentCount: number
  userCount: number
}

export default function ClientsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      alert('Nombre y código son requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchClients()
        setShowCreateModal(false)
        setFormData({ name: '', code: '', description: '' })
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al crear cliente')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      code: client.code,
      description: client.description || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingClient) return

    if (!formData.name || !formData.code) {
      alert('Nombre y código son requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchClients()
        setShowEditModal(false)
        setEditingClient(null)
        setFormData({ name: '', code: '', description: '' })
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al actualizar cliente')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Error al actualizar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (client: Client) => {
    const action = client.isActive ? 'desactivar' : 'activar'
    const message = client.isActive 
      ? `¿Estás seguro de desactivar el cliente "${client.name}"?\n\nNo se podrá asignar a nuevos agentes o PDVs hasta que sea reactivado.`
      : `¿Estás seguro de activar el cliente "${client.name}"?\n\nPodrá ser asignado a agentes y PDVs nuevamente.`

    if (confirm(message)) {
      try {
        const response = await fetch('/api/clients', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: client.id,
            isActive: !client.isActive
          })
        })

        if (response.ok) {
          await fetchClients() // Recargar la lista desde la base de datos
          alert(`Cliente ${action}do correctamente`)
        } else {
          const errorData = await response.json()
          alert(errorData.error || `Error al ${action} cliente`)
        }
      } catch (error) {
        console.error(`Error ${action}ing client:`, error)
        alert('Error de conexión. Verifica que el servidor esté funcionando.')
      }
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
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Administra los clientes del sistema
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
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Cliente
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
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {clients.filter(c => c.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total PDVs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {clients.reduce((acc, c) => acc + c.pdvCount, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {clients.reduce((acc, c) => acc + c.agentCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Descripción</th>
                  <th className="text-center p-4 font-medium">PDVs</th>
                  <th className="text-center p-4 font-medium">Agentes</th>
                  <th className="text-center p-4 font-medium">Usuarios</th>
                  <th className="text-center p-4 font-medium">Estado</th>
                  <th className="text-center p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${client.isActive ? 'bg-blue-50 dark:bg-blue-950' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                          <Building2 className={`h-4 w-4 ${client.isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground font-mono">
                            {client.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {client.description || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {client.pdvCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {client.agentCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {client.userCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        client.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {client.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(client)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleToggleActive(client)}
                          className={`h-8 w-8 ${
                            client.isActive 
                              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
                          }`}
                          title={client.isActive ? 'Desactivar cliente' : 'Activar cliente'}
                        >
                          {client.isActive ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
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

      {!loading && clients.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No hay clientes</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea el primer cliente para comenzar
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Importar Clientes desde Excel</CardTitle>
              <CardDescription>
                Importa múltiples clientes desde un archivo Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImport 
                type="clients"
                onImportComplete={() => {
                  setShowImportModal(false)
                }}
                onRefresh={fetchClients}
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

      {/* Edit Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editar Cliente</CardTitle>
              <CardDescription>
                Modifica la información del cliente: {editingClient.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre del Cliente *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Coca-Cola Chile"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Código *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: CC-CL"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción (opcional)</label>
                  <textarea 
                    placeholder="Descripción del cliente"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingClient(null)
                      setFormData({ name: '', code: '', description: '' })
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
                      'Actualizar Cliente'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Crear Nuevo Cliente</CardTitle>
              <CardDescription>
                Complete los datos del nuevo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre del Cliente *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Coca-Cola Chile"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Código *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: CC-CL"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción (opcional)</label>
                  <textarea 
                    placeholder="Descripción del cliente"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ name: '', code: '', description: '' })
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleCreate}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Cliente'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}

