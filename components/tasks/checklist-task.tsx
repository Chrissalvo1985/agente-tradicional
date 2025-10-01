'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  X,
  Camera,
  CheckCircle2,
  Save,
  Circle,
  User,
  Plus,
  Trash2
} from 'lucide-react'
import { CameraCapture } from '@/components/camera/camera-capture'

interface ChecklistItem {
  id: string
  name: string
  description: string | null
  requiresPhoto: boolean
  isRequired: boolean
  order: number
}

interface ChecklistItemData {
  itemId: string
  completed: boolean
  photoUrl: string | null
  names: string[]
  notes: string | null
}

interface ChecklistTaskProps {
  templateName: string
  items: ChecklistItem[]
  onComplete: (data: ChecklistItemData[]) => void
  onCancel: () => void
}

export function ChecklistTask({ 
  templateName, 
  items, 
  onComplete, 
  onCancel 
}: ChecklistTaskProps) {
  const [itemData, setItemData] = useState<Record<string, ChecklistItemData>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [currentItem, setCurrentItem] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const handleToggleComplete = (itemId: string) => {
    setItemData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        completed: !(prev[itemId]?.completed ?? false),
        photoUrl: prev[itemId]?.photoUrl ?? null,
        names: prev[itemId]?.names ?? [],
        notes: prev[itemId]?.notes ?? null
      }
    }))
  }

  const handleCapture = (imageBase64: string) => {
    if (currentItem) {
      setItemData(prev => ({
        ...prev,
        [currentItem]: {
          ...prev[currentItem],
          itemId: currentItem,
          completed: prev[currentItem]?.completed ?? false,
          photoUrl: imageBase64,
          names: prev[currentItem]?.names ?? [],
          notes: prev[currentItem]?.notes ?? null
        }
      }))
    }
    setShowCamera(false)
    setCurrentItem(null)
  }

  const handleAddName = (itemId: string) => {
    if (!newName.trim()) return
    
    setItemData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        completed: prev[itemId]?.completed ?? false,
        photoUrl: prev[itemId]?.photoUrl ?? null,
        names: [...(prev[itemId]?.names ?? []), newName.trim()],
        notes: prev[itemId]?.notes ?? null
      }
    }))
    setNewName('')
  }

  const handleRemoveName = (itemId: string, index: number) => {
    setItemData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        completed: prev[itemId]?.completed ?? false,
        photoUrl: prev[itemId]?.photoUrl ?? null,
        names: (prev[itemId]?.names ?? []).filter((_, i) => i !== index),
        notes: prev[itemId]?.notes ?? null
      }
    }))
  }

  const handleNotesChange = (itemId: string, notes: string) => {
    setItemData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        completed: prev[itemId]?.completed ?? false,
        photoUrl: prev[itemId]?.photoUrl ?? null,
        names: prev[itemId]?.names ?? [],
        notes: notes || null
      }
    }))
  }

  const handleSave = () => {
    const data = items.map(item => 
      itemData[item.id] || {
        itemId: item.id,
        completed: false,
        photoUrl: null,
        names: [],
        notes: null
      }
    )
    onComplete(data)
  }

  const getCompletionPercentage = () => {
    const completed = items.filter(item => itemData[item.id]?.completed).length
    return Math.round((completed / items.length) * 100)
  }

  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 shadow-2xl relative z-[9999]">
        <CardHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{templateName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Checklist de implementaciones y exhibiciones
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold">{getCompletionPercentage()}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {sortedItems.map((item) => {
            const data = itemData[item.id]
            const isCompleted = data?.completed ?? false

            return (
              <Card 
                key={item.id} 
                className={isCompleted ? 'border-green-200 dark:border-green-900' : ''}
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {item.name}
                          {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Photo */}
                    {item.requiresPhoto && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Evidencia Fotográfica
                          {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {data?.photoUrl ? (
                          <div className="relative w-full max-w-sm">
                            <img 
                              src={data.photoUrl} 
                              alt="Evidence"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 right-2"
                              onClick={() => {
                                setCurrentItem(item.id)
                                setShowCamera(true)
                              }}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Cambiar Foto
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentItem(item.id)
                              setShowCamera(true)
                            }}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Tomar Foto
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Names */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Nombres Asociados
                      </label>
                      <div className="space-y-2">
                        {data?.names && data.names.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {data.names.map((name, index) => (
                              <div 
                                key={index}
                                className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                              >
                                <User className="h-3 w-3" />
                                <span>{name}</span>
                                <button
                                  onClick={() => handleRemoveName(item.id, index)}
                                  className="hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nombre de persona"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddName(item.id)
                              }
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddName(item.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Notas
                      </label>
                      <textarea
                        placeholder="Observaciones adicionales..."
                        value={data?.notes ?? ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {items.filter(item => itemData[item.id]?.completed).length} de {items.length} completados
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Tarea
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => {
            setShowCamera(false)
            setCurrentItem(null)
          }}
        />
      )}
    </div>
  )
}

