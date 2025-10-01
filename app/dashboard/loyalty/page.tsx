'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CameraCapture } from '@/components/camera/camera-capture'
import { 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Gift,
  Star,
  Trophy,
  TrendingUp,
  Ticket,
  User
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReceiptData {
  total: number
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  confidence: number
  date?: string
  store?: string
}

interface Customer {
  id: string
  name: string
  phone: string
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  points: number
  totalSpent: number
}

const LEVEL_CONFIG = {
  BRONZE: { color: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-950', icon: Star, minPoints: 0 },
  SILVER: { color: 'text-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-950', icon: Star, minPoints: 1000 },
  GOLD: { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', icon: Star, minPoints: 5000 },
  PLATINUM: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', icon: Trophy, minPoints: 10000 },
  DIAMOND: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', icon: Trophy, minPoints: 25000 }
}

export default function LoyaltyPage() {
  const [showCamera, setShowCamera] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Mock customers
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      phone: '+56912345678',
      level: 'GOLD',
      points: 6420,
      totalSpent: 642000
    },
    {
      id: '2',
      name: 'María González',
      phone: '+56987654321',
      level: 'PLATINUM',
      points: 12350,
      totalSpent: 1235000
    },
    {
      id: '3',
      name: 'Carlos Muñoz',
      phone: '+56923456789',
      level: 'SILVER',
      points: 2180,
      totalSpent: 218000
    }
  ]

  const handleCapture = async (imageBase64: string) => {
    setCapturedImage(imageBase64)
    setShowCamera(false)
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar boleta')
      }

      const data = await response.json()
      setReceiptData(data.receipt || null)
    } catch (err) {
      setError('Error al procesar la boleta. Intenta nuevamente.')
      console.error('Error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculatePoints = (amount: number) => {
    // 1 punto por cada $100 gastados
    return Math.floor(amount / 100)
  }

  const handleAssignPoints = () => {
    if (receiptData && selectedCustomer) {
      const points = calculatePoints(receiptData.total)
      console.log(`Asignando ${points} puntos a ${selectedCustomer.name}`)
      // Implementar lógica de asignación
      // Reset
      setCapturedImage(null)
      setReceiptData(null)
      setSelectedCustomer(null)
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Compadre Almacenero
          </h1>
          <p className="text-muted-foreground">
            Programa de fidelización con escaneo automático de boletas
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockCustomers.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Puntos Otorgados Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">1,240</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Boletas Procesadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">18</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Precisión IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">96%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seleccionar Cliente</CardTitle>
              <CardDescription>
                Elige el cliente antes de escanear la boleta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCustomers.map((customer) => {
                const levelConfig = LEVEL_CONFIG[customer.level]
                const LevelIcon = levelConfig.icon

                return (
                  <Card
                    key={customer.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCustomer?.id === customer.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${levelConfig.bg}`}>
                          <User className={`h-5 w-5 ${levelConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {customer.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {customer.phone}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${levelConfig.bg}`}>
                              <LevelIcon className={`h-3 w-3 ${levelConfig.color}`} />
                              <span className={`text-xs font-medium ${levelConfig.color}`}>
                                {customer.level}
                              </span>
                            </div>
                            <span className="text-xs font-medium">
                              {customer.points.toLocaleString('es-CL')} pts
                            </span>
                          </div>
                        </div>
                        {selectedCustomer?.id === customer.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </CardContent>
          </Card>

          {/* Receipt Capture */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Escanear Boleta</CardTitle>
              <CardDescription>
                Captura la boleta para procesar puntos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!capturedImage ? (
                <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No hay boleta capturada
                    </p>
                    <Button 
                      onClick={() => setShowCamera(true)}
                      disabled={!selectedCustomer}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Escanear Boleta
                    </Button>
                    {!selectedCustomer && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Selecciona un cliente primero
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    <img
                      src={capturedImage}
                      alt="Captured receipt"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setCapturedImage(null)
                        setReceiptData(null)
                        setError(null)
                      }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setShowCamera(true)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Rehacer
                    </Button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="p-6 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm font-medium">Procesando boleta con IA...</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Extrayendo datos y calculando puntos
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-sm text-destructive/90">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalle de Boleta</CardTitle>
              <CardDescription>
                {receiptData 
                  ? `${receiptData.items.length} productos` 
                  : 'Los detalles aparecerán aquí'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!receiptData ? (
                <div className="text-center py-12">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Escanea una boleta para ver los detalles
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Receipt Items */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {receiptData.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(receiptData.total)}
                      </span>
                    </div>

                    {/* Points Calculation */}
                    <div className="bg-primary/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Puntos a otorgar</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold text-primary">
                            +{calculatePoints(receiptData.total)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        1 punto por cada $100 gastados
                      </p>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confianza IA</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${receiptData.confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-medium">
                          {Math.round(receiptData.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button 
                      className="w-full" 
                      onClick={handleAssignPoints}
                      disabled={!selectedCustomer}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Asignar Puntos
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </main>
  )
}
