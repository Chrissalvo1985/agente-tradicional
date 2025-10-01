'use client'

import { useEffect, useState, useRef, useId } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'current' | 'pdv' | 'completed'
  status?: string
}

interface RouteMapProps {
  locations: Location[]
  currentPosition?: { latitude: number; longitude: number }
  center?: [number, number]
  zoom?: number
}

export function RouteMap({ 
  locations, 
  currentPosition,
  center = [-33.4489, -70.6693],
  zoom = 13 
}: RouteMapProps) {
  const [isClient, setIsClient] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const componentId = useId()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return

    let L: any
    let map: any
    let mounted = true

    const initMap = async () => {
      try {
        // Importar Leaflet y CSS
        const leaflet = await import('leaflet')
        L = leaflet.default
        await import('leaflet/dist/leaflet.css')

        if (!mounted) return

        // Si ya existe un mapa, no reinicializar
        if (mapInstanceRef.current) {
          return
        }

        // Limpiar el contenedor
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = ''
        }

        const mapCenter: [number, number] = currentPosition 
          ? [currentPosition.latitude, currentPosition.longitude]
          : center

        // Crear mapa
        map = L.map(mapContainerRef.current!, {
          center: mapCenter,
          zoom: zoom,
          zoomControl: true
        })

        mapInstanceRef.current = map

        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map)

        // Crear línea de ruta
        if (locations.length > 1) {
          const routeCoordinates = locations.map(loc => [loc.latitude, loc.longitude] as [number, number])
          L.polyline(routeCoordinates, {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7
          }).addTo(map)
        }

        // Agregar marcadores de PDV
        locations.forEach((location) => {
          const marker = L.marker([location.latitude, location.longitude]).addTo(map)
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${location.name}</h3>
              <p class="text-sm text-muted-foreground">
                ${location.type === 'completed' ? '✓ Completado' : 'Pendiente'}
              </p>
            </div>
          `)
        })

        // Marcador de posición actual
        if (currentPosition) {
          const currentMarker = L.marker([currentPosition.latitude, currentPosition.longitude]).addTo(map)
          currentMarker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">Tu ubicación</h3>
              <p class="text-sm text-muted-foreground">Posición actual</p>
            </div>
          `)
        }

        // Invalidar tamaño después de un breve delay para asegurar renderizado correcto
        setTimeout(() => {
          if (mapInstanceRef.current && mounted) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    // Cleanup
    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          console.error('Error removing map:', e)
        }
        mapInstanceRef.current = null
      }
    }
  }, [isClient])

  if (!isClient) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden h-[600px] relative z-0">
      <div 
        ref={mapContainerRef} 
        id={`map-${componentId}`}
        className="relative z-0"
        style={{ height: '100%', width: '100%' }} 
      />
    </Card>
  )
}
