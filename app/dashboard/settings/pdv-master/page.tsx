'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  MapPin,
  Edit,
  Trash2,
  ArrowLeft,
  Store,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  FileSpreadsheet
} from 'lucide-react'
import Link from 'next/link'
import ExcelImport from '@/components/import/excel-import'
import Pagination from '@/components/ui/pagination'

interface PDVMaster {
  id: string
  name: string
  address: string
  city: string
  region: string
  phone: string | null
  email: string | null
  latitude: number
  longitude: number
  isActive: boolean
  clientsCount: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function PDVMasterPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingPDV, setEditingPDV] = useState<PDVMaster | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pdvs, setPdvs] = useState<PDVMaster[]>([])
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
    name: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: ''
  })

  useEffect(() => {
    fetchPDVs()
  }, [])

  const fetchPDVs = async (page: number = pagination.page, limit: number = pagination.limit) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      const response = await fetch(`/api/pdv-masters?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPdvs(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching PDV masters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.region) {
      alert('Nombre, dirección, ciudad y región son requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/pdv-masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude || '0',
          longitude: formData.longitude || '0'
        })
      })

      if (response.ok) {
        await fetchPDVs()
        setShowCreateModal(false)
        setFormData({ name: '', address: '', city: '', region: '', phone: '', email: '', latitude: '', longitude: '' })
      } else {
        alert('Error al crear PDV')
      }
    } catch (error) {
      console.error('Error creating PDV:', error)
      alert('Error al crear PDV')
    } finally {
      setSaving(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchPDVs(page, pagination.limit)
  }

  const filteredPDVs = pdvs.filter(pdv =>
    pdv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdv.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdv.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (pdv: PDVMaster) => {
    setEditingPDV(pdv)
    setFormData({
      name: pdv.name,
      address: pdv.address,
      city: pdv.city,
      region: pdv.region,
      phone: pdv.phone || '',
      email: pdv.email || '',
      latitude: pdv.latitude.toString(),
      longitude: pdv.longitude.toString()
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingPDV) return

    if (!formData.name || !formData.address || !formData.city || !formData.region) {
      alert('Nombre, dirección, ciudad y región son requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/pdv-masters/${editingPDV.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude || '0',
          longitude: formData.longitude || '0'
        })
      })

      if (response.ok) {
        await fetchPDVs()
        setShowEditModal(false)
        setEditingPDV(null)
        setFormData({ name: '', address: '', city: '', region: '', phone: '', email: '', latitude: '', longitude: '' })
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al actualizar PDV')
      }
    } catch (error) {
      console.error('Error updating PDV:', error)
      alert('Error al actualizar PDV')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pdv: PDVMaster) => {
    if (pdv.clientsCount > 0) {
      alert(`No se puede eliminar "${pdv.name}" porque está asignado a ${pdv.clientsCount} cliente(s).\n\nPrimero elimina las asignaciones.`)
      return
    }
    
    if (confirm(`¿Estás seguro de eliminar el PDV "${pdv.name}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/pdv-masters/${pdv.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchPDVs() // Recargar la lista desde la base de datos
          alert('PDV eliminado correctamente')
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'Error al eliminar PDV')
        }
      } catch (error) {
        console.error('Error deleting PDV:', error)
        alert('Error de conexión. Verifica que el servidor esté funcionando.')
      }
    }
  }

  const handleToggleActive = async (pdv: PDVMaster) => {
    const action = pdv.isActive ? 'desactivar' : 'activar'
    const message = pdv.isActive 
      ? `¿Estás seguro de desactivar el PDV "${pdv.name}"?\n\nNo se podrá asignar a nuevos clientes hasta que sea reactivado.`
      : `¿Estás seguro de activar el PDV "${pdv.name}"?\n\nPodrá ser asignado a clientes nuevamente.`

    if (confirm(message)) {
      try {
        const response = await fetch('/api/pdv-masters', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: pdv.id,
            isActive: !pdv.isActive
          })
        })

        if (response.ok) {
          await fetchPDVs() // Recargar la lista desde la base de datos
          alert(`PDV ${action}do correctamente`)
        } else {
          const errorData = await response.json()
          alert(errorData.error || `Error al ${action} PDV`)
        }
      } catch (error) {
        console.error(`Error ${action}ing PDV:`, error)
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
            <h1 className="text-3xl font-bold tracking-tight">Maestra de PDVs</h1>
            <p className="text-muted-foreground">
              Catálogo global de puntos de venta
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
            Nuevo PDV
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
              Total PDVs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pdvs.length}</p>
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
              {pdvs.filter(p => p.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {pdvs.filter(p => p.clientsCount > 0).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Asignar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {pdvs.filter(p => p.clientsCount === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Elementos por página:</span>
              <select 
                value={pagination.limit}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value)
                  fetchPDVs(1, newLimit)
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

      {/* PDVs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">PDV</th>
                  <th className="text-left p-4 font-medium">Ubicación</th>
                  <th className="text-left p-4 font-medium">Contacto</th>
                  <th className="text-center p-4 font-medium">Clientes</th>
                  <th className="text-center p-4 font-medium">Estado</th>
                  <th className="text-center p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPDVs.map((pdv) => (
                  <tr key={pdv.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${pdv.isActive ? 'bg-purple-50 dark:bg-purple-950' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                          <Store className={`h-4 w-4 ${pdv.isActive ? 'text-purple-600' : 'text-zinc-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">{pdv.name}</div>
                          <div className="text-sm text-muted-foreground">{pdv.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {pdv.city}
                        </div>
                        <div className="text-muted-foreground">{pdv.region}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{pdv.phone || 'No especificado'}</div>
                        <div className="text-muted-foreground">{pdv.email || 'No especificado'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        pdv.clientsCount > 0 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      }`}>
                        {pdv.clientsCount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        pdv.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {pdv.isActive ? (
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
                          onClick={() => handleEdit(pdv)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {pdv.clientsCount > 0 ? (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleToggleActive(pdv)}
                            className={`h-8 w-8 ${
                              pdv.isActive 
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
                            }`}
                            title={pdv.isActive ? 'Desactivar PDV' : 'Activar PDV'}
                          >
                            {pdv.isActive ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(pdv)}
                            title="Eliminar PDV"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
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
      {!loading && pdvs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} PDVs
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {!loading && pdvs.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {searchTerm ? 'No se encontraron PDVs' : 'No hay PDVs'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea el primer PDV para comenzar'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo PDV
                </Button>
              )}
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
              <CardTitle>Importar PDVs desde Excel</CardTitle>
              <CardDescription>
                Importa múltiples PDVs desde un archivo Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImport 
                type="pdv-masters"
                onImportComplete={() => {
                  setShowImportModal(false)
                }}
                onRefresh={fetchPDVs}
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
      {showEditModal && editingPDV && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Editar PDV</CardTitle>
              <CardDescription>
                Modifica la información del PDV: {editingPDV.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Nombre del PDV *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Almacén El Sol"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Dirección *</label>
                  <input 
                    type="text" 
                    placeholder="Av. Principal 123"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ciudad *</label>
                  <input 
                    type="text" 
                    placeholder="Santiago"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Región *</label>
                  <input 
                    type="text" 
                    placeholder="Metropolitana"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono (opcional)</label>
                  <input 
                    type="tel" 
                    placeholder="+56912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email (opcional)</label>
                  <input 
                    type="email" 
                    placeholder="contacto@pdv.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Latitud (opcional)</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="-33.4489"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitud (opcional)</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="-70.6693"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2 flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingPDV(null)
                      setFormData({ name: '', address: '', city: '', region: '', phone: '', email: '', latitude: '', longitude: '' })
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
                      'Actualizar PDV'
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
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Crear Nuevo PDV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Nombre del PDV *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Almacén El Sol"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Dirección *</label>
                  <input 
                    type="text" 
                    placeholder="Av. Principal 123"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ciudad *</label>
                  <input 
                    type="text" 
                    placeholder="Santiago"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Región *</label>
                  <input 
                    type="text" 
                    placeholder="Metropolitana"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono (opcional)</label>
                  <input 
                    type="tel" 
                    placeholder="+56912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email (opcional)</label>
                  <input 
                    type="email" 
                    placeholder="contacto@pdv.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Latitud (opcional)</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="-33.4489"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitud (opcional)</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="-70.6693"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2 flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ name: '', address: '', city: '', region: '', phone: '', email: '', latitude: '', longitude: '' })
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
                      'Crear PDV'
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

