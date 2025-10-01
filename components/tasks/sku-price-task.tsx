'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  X,
  Camera,
  CheckCircle2,
  Save,
  AlertCircle
} from 'lucide-react'
import { CameraCapture } from '@/components/camera/camera-capture'
import { formatCurrency } from '@/lib/utils'

interface SKUItem {
  id: string
  sku: string
  name: string
  brand: string
  targetPrice: number
  category: string
}

interface SKUPriceData {
  skuItemId: string
  price: number | null
  competitorPrice: number | null
  photoUrl: string | null
}

interface SKUPriceTaskProps {
  templateName: string
  skuItems: SKUItem[]
  onComplete: (data: SKUPriceData[]) => void
  onCancel: () => void
}

export function SKUPriceTask({ 
  templateName, 
  skuItems, 
  onComplete, 
  onCancel 
}: SKUPriceTaskProps) {
  const [priceData, setPriceData] = useState<Record<string, SKUPriceData>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [currentSKU, setCurrentSKU] = useState<string | null>(null)

  const handlePriceChange = (skuItemId: string, field: 'price' | 'competitorPrice', value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setPriceData(prev => ({
      ...prev,
      [skuItemId]: {
        ...prev[skuItemId],
        skuItemId,
        price: prev[skuItemId]?.price ?? null,
        competitorPrice: prev[skuItemId]?.competitorPrice ?? null,
        photoUrl: prev[skuItemId]?.photoUrl ?? null,
        [field]: numValue
      }
    }))
  }

  const handleCapture = (imageBase64: string) => {
    if (currentSKU) {
      setPriceData(prev => ({
        ...prev,
        [currentSKU]: {
          ...prev[currentSKU],
          skuItemId: currentSKU,
          price: prev[currentSKU]?.price ?? null,
          competitorPrice: prev[currentSKU]?.competitorPrice ?? null,
          photoUrl: imageBase64
        }
      }))
    }
    setShowCamera(false)
    setCurrentSKU(null)
  }

  const handleSave = () => {
    const data = skuItems.map(item => 
      priceData[item.id] || {
        skuItemId: item.id,
        price: null,
        competitorPrice: null,
        photoUrl: null
      }
    )
    onComplete(data)
  }

  const getCompletionPercentage = () => {
    const filled = skuItems.filter(item => 
      priceData[item.id]?.price !== null && priceData[item.id]?.price !== undefined
    ).length
    return Math.round((filled / skuItems.length) * 100)
  }

  const calculateVariance = (price: number, target: number) => {
    const variance = ((price - target) / target) * 100
    return variance.toFixed(1)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 shadow-2xl relative z-[9999]">
        <CardHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{templateName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Levantamiento de precios por SKU
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
          {skuItems.map((item) => {
            const data = priceData[item.id]
            const hasPrice = data?.price !== null && data?.price !== undefined
            const variance = hasPrice && data.price 
              ? calculateVariance(data.price, item.targetPrice) 
              : null

            return (
              <Card key={item.id} className={hasPrice ? 'border-green-200 dark:border-green-900' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.sku} • {item.brand}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Precio objetivo: {formatCurrency(item.targetPrice)}
                          </p>
                        </div>
                        {hasPrice && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      </div>

                      {/* Price Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Precio PDV
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data?.price ?? ''}
                            onChange={(e) => handlePriceChange(item.id, 'price', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {variance && (
                            <p className={`text-xs mt-1 ${
                              parseFloat(variance) > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {parseFloat(variance) > 0 ? '+' : ''}{variance}% vs objetivo
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Precio Competencia
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data?.competitorPrice ?? ''}
                            onChange={(e) => handlePriceChange(item.id, 'competitorPrice', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photo */}
                    <div className="flex flex-col gap-2">
                      {data?.photoUrl ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img 
                            src={data.photoUrl} 
                            alt="Evidence"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute bottom-1 right-1 h-6 px-2 text-xs"
                            onClick={() => {
                              setCurrentSKU(item.id)
                              setShowCamera(true)
                            }}
                          >
                            <Camera className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-24 h-24"
                          onClick={() => {
                            setCurrentSKU(item.id)
                            setShowCamera(true)
                          }}
                        >
                          <Camera className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>
                {skuItems.length - skuItems.filter(item => priceData[item.id]?.price !== null && priceData[item.id]?.price !== undefined).length} items pendientes
              </span>
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
            setCurrentSKU(null)
          }}
        />
      )}
    </div>
  )
}

