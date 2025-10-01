'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react'

interface ImportResult {
  success: number
  errors: string[]
  total: number
}

interface ExcelImportProps {
  type: 'clients' | 'users' | 'pdv-masters' | 'route-assignments'
  onImportComplete?: (result: ImportResult) => void
  onRefresh?: () => void
}

export default function ExcelImport({ type, onImportComplete, onRefresh }: ExcelImportProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Solo se permiten archivos Excel (.xlsx, .xls)')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 5MB')
      return
    }

    await handleImport(file)
  }

  const handleImport = async (file: File) => {
    setIsUploading(true)
    setImportResult(null)
    setShowResult(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/${type}/import`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setImportResult(data.results)
        setShowResult(true)
        onImportComplete?.(data.results)
        onRefresh?.()
      } else {
        alert(data.error || 'Error al importar el archivo')
      }
    } catch (error) {
      console.error('Error importing file:', error)
      alert('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setIsUploading(false)
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/${type}/import`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `plantilla_${type}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error al descargar la plantilla')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error al descargar la plantilla')
    } finally {
      setIsDownloading(false)
    }
  }

  const getTypeLabel = () => {
    if (type === 'clients') return 'Clientes'
    if (type === 'users') return 'Usuarios'
    if (type === 'pdv-masters') return 'PDVs'
    if (type === 'route-assignments') return 'Planificaciones'
    return 'Registros'
  }

  const getTemplateDescription = () => {
    if (type === 'clients') {
      return 'Descarga la plantilla con los campos: nombre, código, descripción y activo'
    }
    if (type === 'users') {
      return 'Descarga la plantilla con los campos: nombre, email, rol, cliente_código, contraseña y activo'
    }
    if (type === 'pdv-masters') {
      return 'Descarga la plantilla con los campos: nombre, dirección, ciudad, región, teléfono, email, latitud, longitud, código postal y activo'
    }
    if (type === 'route-assignments') {
      return 'Descarga la plantilla con los campos: cliente_código, agente_email, fecha_programada y hora_programada'
    }
    return 'Descarga la plantilla con los campos requeridos'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar {getTypeLabel()} desde Excel
          </CardTitle>
          <CardDescription>
            {getTemplateDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Descargar plantilla */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Plantilla de ejemplo</p>
                <p className="text-sm text-muted-foreground">
                  Descarga el formato correcto para importar {getTypeLabel().toLowerCase()}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </>
              )}
            </Button>
          </div>

          {/* Subir archivo */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Subir archivo Excel</p>
                <p className="text-sm text-muted-foreground">
                  Selecciona un archivo .xlsx o .xls para importar
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar archivo
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Instrucciones importantes:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Descarga primero la plantilla para ver el formato correcto</li>
                  <li>• No modifiques los nombres de las columnas (primera fila)</li>
                  <li>• Los campos marcados con * son obligatorios</li>
                  <li>• Para "activo" usa: si/sí/true/1 para activo, no/false/0 para inactivo</li>
                  {type === 'users' && (
                    <>
                      <li>• Para "rol" usa: SUPER_ADMIN, ADMIN, STORE_KEEPER, AGENT</li>
                      <li>• Para "cliente_código" usa el código del cliente (vacío para SUPER_ADMIN)</li>
                      <li>• La contraseña debe tener al menos 6 caracteres</li>
                    </>
                  )}
                  {type === 'pdv-masters' && (
                    <>
                      <li>• Los campos "teléfono", "email", "latitud", "longitud" y "código postal" son opcionales</li>
                      <li>• Las coordenadas deben ser números válidos (latitud: -90 a 90, longitud: -180 a 180)</li>
                      <li>• El email debe ser válido si se proporciona</li>
                    </>
                  )}
                  {type === 'route-assignments' && (
                    <>
                      <li>• El campo "hora_programada" es opcional (por defecto: 09:00)</li>
                      <li>• El "cliente_código" debe existir en el sistema</li>
                      <li>• El "agente_email" debe existir y pertenecer al cliente especificado</li>
                      <li>• La "fecha_programada" debe estar en formato YYYY-MM-DD</li>
                      <li>• La "hora_programada" debe estar en formato HH:MM (24 horas)</li>
                    </>
                  )}
                  <li>• El archivo no puede ser mayor a 5MB</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de importación */}
      {showResult && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success === importResult.total ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              Resultados de la importación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                  <p className="text-sm text-muted-foreground">Exitosos</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                  <p className="text-sm text-muted-foreground">Errores</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{importResult.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Errores */}
              {importResult.errors.length > 0 && (
                <div>
                  <p className="font-medium text-red-600 mb-2">Errores encontrados:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700 dark:text-red-300">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje de éxito */}
              {importResult.success > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ {importResult.success} {getTypeLabel().toLowerCase()} importados correctamente
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
