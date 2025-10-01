'use client'

import { useState, useEffect } from 'react'

export interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface GeolocationError {
  code: number
  message: string
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocalización no soportada por el navegador'
      })
      setLoading(false)
      return
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp
      })
      setError(null)
      setLoading(false)
    }

    const handleError = (err: GeolocationPositionError) => {
      setError({
        code: err.code,
        message: err.message
      })
      setLoading(false)
    }

    // Obtener posición actual
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })

    // Watch position para actualizaciones en tiempo real
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const requestPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      return result.state
    } catch (err) {
      return 'denied'
    }
  }

  return { position, error, loading, requestPermission }
}
