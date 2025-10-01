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
  Shield,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  FileSpreadsheet
} from 'lucide-react'
import Link from 'next/link'
import ExcelImport from '@/components/import/excel-import'

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STORE_KEEPER' | 'AGENT'

interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  clientId: string | null
  clientName: string | null
  isActive: boolean
}

interface Client {
  id: string
  name: string
}

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [users, setUsers] = useState<SystemUser[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'AGENT' as UserRole,
    clientId: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchClients()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Nombre, email y contraseña son requeridos')
      return
    }

    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.role !== 'SUPER_ADMIN' && !formData.clientId) {
      alert('Debe seleccionar un cliente para roles que no son Super Admin')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientId: formData.role === 'SUPER_ADMIN' ? null : formData.clientId
        })
      })

      if (response.ok) {
        await fetchUsers()
        setShowCreateModal(false)
        setFormData({ name: '', email: '', role: 'AGENT', clientId: '', password: '' })
        setShowPassword(false)
      } else {
        alert('Error al crear usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Administrador',
      STORE_KEEPER: 'Almacenero',
      AGENT: 'Agente'
    }
    return labels[role]
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      SUPER_ADMIN: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
      ADMIN: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      STORE_KEEPER: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      AGENT: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
    }
    return colors[role]
  }

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId || '',
      password: ''
    })
    setShowPassword(false)
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    if (!formData.name || !formData.email) {
      alert('Nombre y email son requeridos')
      return
    }

    if (formData.password && formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.role !== 'SUPER_ADMIN' && !formData.clientId) {
      alert('Debe seleccionar un cliente para roles que no son Super Admin')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          ...formData,
          clientId: formData.role === 'SUPER_ADMIN' ? null : formData.clientId
        })
      })

      if (response.ok) {
        await fetchUsers()
        setShowEditModal(false)
        setEditingUser(null)
        setFormData({ name: '', email: '', role: 'AGENT', clientId: '', password: '' })
        setShowPassword(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al actualizar usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: SystemUser) => {
    const action = user.isActive ? 'desactivar' : 'activar'
    const message = user.isActive 
      ? `¿Estás seguro de desactivar al usuario "${user.name}"?\n\nNo podrá acceder a la aplicación hasta que sea reactivado.`
      : `¿Estás seguro de activar al usuario "${user.name}"?\n\nPodrá acceder a la aplicación nuevamente.`

    if (confirm(message)) {
      try {
        const response = await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            isActive: !user.isActive
          })
        })

        if (response.ok) {
          await fetchUsers() // Recargar la lista desde la base de datos
          alert(`Usuario ${action}do correctamente`)
        } else {
          const errorData = await response.json()
          alert(errorData.error || `Error al ${action} usuario`)
        }
      } catch (error) {
        console.error(`Error ${action}ing user:`, error)
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
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestiona usuarios, roles y asignaciones de clientes
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
            Nuevo Usuario
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
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Super Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {users.filter(u => u.role === 'SUPER_ADMIN').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === 'AGENT').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Usuario</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-center p-4 font-medium">Rol</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-center p-4 font-medium">Estado</th>
                  <th className="text-center p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${user.isActive ? 'bg-green-50 dark:bg-green-950' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                          <User className={`h-4 w-4 ${user.isActive ? 'text-green-600' : 'text-zinc-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {user.clientName || 'Sin cliente asignado'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.isActive ? (
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
                          onClick={() => handleEdit(user)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleToggleActive(user)}
                          className={`h-8 w-8 ${
                            user.isActive 
                              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
                          }`}
                          title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {user.isActive ? (
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

      {!loading && users.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No hay usuarios</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea el primer usuario para comenzar
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
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
              <CardTitle>Importar Usuarios desde Excel</CardTitle>
              <CardDescription>
                Importa múltiples usuarios desde un archivo Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImport 
                type="users"
                onImportComplete={() => {
                  setShowImportModal(false)
                }}
                onRefresh={fetchUsers}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Crear Nuevo Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <input 
                    type="text" 
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <input 
                    type="email" 
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contraseña del Sistema *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese la contraseña para el usuario"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full mt-1 px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      💡 Información importante:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Esta será la contraseña inicial del usuario</li>
                      <li>• El usuario podrá cambiarla en su primer login</li>
                      <li>• Mínimo 6 caracteres requerido</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Rol *</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="AGENT">Agente</option>
                    <option value="STORE_KEEPER">Almacenero</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                {formData.role !== 'SUPER_ADMIN' && (
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
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ name: '', email: '', role: 'AGENT', clientId: '', password: '' })
                      setShowPassword(false)
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
                      'Crear Usuario'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editar Usuario</CardTitle>
              <CardDescription>
                Modifica los datos del usuario: {editingUser.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <input 
                    type="text" 
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <input 
                    type="email" 
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nueva Contraseña (opcional)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Dejar vacío para mantener la actual"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full mt-1 px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
                      ⚠️ Información importante:
                    </p>
                    <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                      <li>• Dejar vacío para mantener la contraseña actual</li>
                      <li>• Si ingresa una nueva, reemplazará la actual</li>
                      <li>• Mínimo 6 caracteres si se cambia</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Rol *</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="AGENT">Agente</option>
                    <option value="STORE_KEEPER">Almacenero</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                {formData.role !== 'SUPER_ADMIN' && (
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
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                      setFormData({ name: '', email: '', role: 'AGENT', clientId: '', password: '' })
                      setShowPassword(false)
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
                      'Actualizar Usuario'
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
