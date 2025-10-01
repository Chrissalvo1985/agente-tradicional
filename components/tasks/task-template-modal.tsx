'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Download,
  Tag,
  ClipboardList,
  Loader2,
  AlertCircle
} from 'lucide-react'

type TemplateType = 'PRICE_AUDIT_SKU' | 'EXHIBITION_CHECKLIST'

interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  targetPrice: number
}

interface ChecklistItem {
  name: string
  description: string
  requiresPhoto: boolean
  isRequired: boolean
}

interface TaskTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: any) => void
  editingTemplate?: any
}

export default function TaskTemplateModal({
  isOpen,
  onClose,
  onSave,
  editingTemplate
}: TaskTemplateModalProps) {
  const [templateType, setTemplateType] = useState<TemplateType>('PRICE_AUDIT_SKU')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [templateProducts, setTemplateProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name)
      setDescription(editingTemplate.description || '')
      setTemplateType(editingTemplate.type)
      
      if (editingTemplate.type === 'PRICE_AUDIT_SKU' && editingTemplate.skuItems) {
        const products = editingTemplate.skuItems.map((item: any) => ({
          id: item.productId,
          sku: item.product.sku,
          name: item.product.name,
          category: item.product.category,
          brand: item.product.brand,
          targetPrice: item.product.targetPrice
        }))
        setTemplateProducts(products)
        setSelectedProducts(editingTemplate.skuItems.map((item: any) => item.productId))
      }
      
      if (editingTemplate.type === 'EXHIBITION_CHECKLIST' && editingTemplate.checklistItems) {
        setChecklistItems(editingTemplate.checklistItems.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          requiresPhoto: item.requiresPhoto,
          isRequired: item.isRequired
        })))
      }
    } else {
      resetForm()
    }
  }, [editingTemplate, isOpen])

  const resetForm = () => {
    setName('')
    setDescription('')
    setTemplateType('PRICE_AUDIT_SKU')
    setSelectedProducts([])
    setChecklistItems([])
    setTemplateProducts([])
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Si hay productos temporales, crearlos primero
      const tempProducts = templateProducts.filter(p => p.id.startsWith('temp-'))
      const createdProductIds: string[] = []

      for (const tempProduct of tempProducts) {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sku: tempProduct.sku,
              name: tempProduct.name,
              category: tempProduct.category,
              brand: tempProduct.brand,
              targetPrice: tempProduct.targetPrice
            })
          })

          if (response.ok) {
            const createdProduct = await response.json()
            createdProductIds.push(createdProduct.id)
          }
        } catch (error) {
          console.error('Error creating product:', error)
        }
      }

      // Actualizar la lista de productos seleccionados con los IDs reales
      const finalSelectedProducts = selectedProducts.map(productId => {
        const tempProduct = tempProducts.find(p => p.id === productId)
        if (tempProduct) {
          // Encontrar el producto creado correspondiente
          const createdProduct = createdProductIds.find((_, index) => 
            tempProducts[index].id === productId
          )
          return createdProduct || productId
        }
        return productId
      }).filter(Boolean)

      const templateData = {
        name: name.trim(),
        description: description.trim(),
        type: templateType,
        items: templateType === 'PRICE_AUDIT_SKU' 
          ? finalSelectedProducts.map(productId => ({ productId, isRequired: true }))
          : checklistItems
      }

      await onSave(templateData)
      handleClose()
    } catch (error) {
      setError('Error al guardar la plantilla')
    } finally {
      setLoading(false)
    }
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const addChecklistItem = () => {
    setChecklistItems(prev => [...prev, {
      name: '',
      description: '',
      requiresPhoto: true,
      isRequired: true
    }])
  }

  const updateChecklistItem = (index: number, field: keyof ChecklistItem, value: any) => {
    setChecklistItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const removeChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index))
  }

  const addManualProduct = () => {
    const newProduct: Product = {
      id: `temp-manual-${Date.now()}`,
      sku: '',
      name: '',
      category: '',
      brand: '',
      targetPrice: 0
    }
    setTemplateProducts(prev => [...prev, newProduct])
    setSelectedProducts(prev => [...prev, newProduct.id])
  }

  const updateProduct = (productId: string, field: keyof Product, value: any) => {
    setTemplateProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, [field]: value } : product
    ))
  }

  const removeProduct = (productId: string) => {
    setTemplateProducts(prev => prev.filter(p => p.id !== productId))
    setSelectedProducts(prev => prev.filter(id => id !== productId))
  }

  const handleImportProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError('')

    try {
      if (editingTemplate) {
        // Si estamos editando, usar la plantilla existente
        const formData = new FormData()
        formData.append('file', file)
        formData.append('templateId', editingTemplate.id)

        const response = await fetch('/api/task-templates/import-products', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Error al importar productos')
        }

        // Recargar la página para mostrar los cambios
        window.location.reload()
      } else {
        // Si estamos creando, procesar el archivo y actualizar la lista de productos seleccionados
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet)

        if (!data || data.length === 0) {
          throw new Error('El archivo está vacío')
        }

        // Validar estructura del archivo
        const requiredColumns = ['sku', 'name', 'category', 'brand', 'targetPrice']
        const firstRow = data[0] as any
        const missingColumns = requiredColumns.filter(col => !(col in firstRow))

        if (missingColumns.length > 0) {
          throw new Error(`Faltan las siguientes columnas: ${missingColumns.join(', ')}`)
        }

        // Crear productos temporalmente y seleccionarlos
        const importedProducts: Product[] = []
        for (const row of data) {
          const productData = row as any
          const sku = String(productData.sku).trim()
          const name = String(productData.name).trim()
          const category = String(productData.category).trim()
          const brand = String(productData.brand).trim()
          const targetPrice = parseFloat(productData.targetPrice)

          if (sku && name && category && brand && !isNaN(targetPrice)) {
            // Crear producto temporal con ID único
            importedProducts.push({
              id: `temp-${sku}-${Date.now()}`,
              sku,
              name,
              category,
              brand,
              targetPrice
            })
          }
        }

        if (importedProducts.length > 0) {
          // Agregar productos importados a la lista de la plantilla
          setTemplateProducts(prev => [...prev, ...importedProducts])
          
          // Seleccionar todos los productos importados
          const importedProductIds = importedProducts.map(p => p.id)
          setSelectedProducts(prev => [...new Set([...prev, ...importedProductIds])])
          
          alert(`${importedProducts.length} productos importados correctamente`)
        } else {
          throw new Error('No se pudieron procesar productos del archivo')
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al importar productos')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    // Descargar el archivo de plantilla desde la carpeta public
    const link = document.createElement('a')
    link.href = '/plantilla-productos.xlsx'
    link.download = 'plantilla-productos.xlsx'
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de la plantilla</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Levantamiento Precios Supermercados"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descripción de la plantilla..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de plantilla</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTemplateType('PRICE_AUDIT_SKU')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    templateType === 'PRICE_AUDIT_SKU'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Precios por SKU</div>
                      <div className="text-sm text-gray-600">Levantamiento de precios de productos</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('EXHIBITION_CHECKLIST')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    templateType === 'EXHIBITION_CHECKLIST'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Checklist Exhibición</div>
                      <div className="text-sm text-gray-600">Verificación de implementaciones</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Configuración de items */}
          {templateType === 'PRICE_AUDIT_SKU' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Productos a evaluar</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addManualProduct()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Plantilla
                  </Button>
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={importing}
                    >
                      <span>
                        {importing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Importar Excel
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleImportProducts}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {templateProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No hay productos configurados</p>
                    <p className="text-xs">Agrega productos manualmente o importa desde Excel</p>
                  </div>
                ) : (
                  templateProducts.map((product) => (
                    <div key={product.id} className="p-3 border-b last:border-b-0">
                      {product.id.startsWith('temp-manual-') ? (
                        // Formulario para productos manuales
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Producto Nuevo</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">SKU</label>
                              <input
                                type="text"
                                value={product.sku}
                                onChange={(e) => updateProduct(product.id, 'sku', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Código del producto"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Precio</label>
                              <input
                                type="number"
                                step="0.01"
                                value={product.targetPrice}
                                onChange={(e) => updateProduct(product.id, 'targetPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Nombre</label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nombre del producto"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">Categoría</label>
                              <input
                                type="text"
                                value={product.category}
                                onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Categoría"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Marca</label>
                              <input
                                type="text"
                                value={product.brand}
                                onChange={(e) => updateProduct(product.id, 'brand', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Marca"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Vista normal para productos existentes
                        <label className="flex items-center gap-3 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductToggle(product.id)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {product.name}
                              {product.id.startsWith('temp-') && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Importado
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              SKU: {product.sku} | {product.brand} | ${product.targetPrice}
                            </div>
                          </div>
                        </label>
                      )}
                    </div>
                  ))
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedProducts.length} producto(s) seleccionado(s)
                  {templateProducts.some(p => p.id.startsWith('temp-')) && (
                    <span className="ml-2 text-blue-600 font-medium">
                      (incluye productos importados)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {templateType === 'EXHIBITION_CHECKLIST' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Items del checklist</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addChecklistItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              <div className="space-y-3">
                {checklistItems.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateChecklistItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Verificar exhibición en góndola principal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateChecklistItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Descripción detallada del item..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.requiresPhoto}
                          onChange={(e) => updateChecklistItem(index, 'requiresPhoto', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Requiere foto</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          onChange={(e) => updateChecklistItem(index, 'isRequired', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Obligatorio</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {checklistItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay items en el checklist</p>
                  <p className="text-sm">Agrega items para crear la plantilla</p>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || (templateType === 'PRICE_AUDIT_SKU' && selectedProducts.length === 0) || (templateType === 'EXHIBITION_CHECKLIST' && checklistItems.length === 0)}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
