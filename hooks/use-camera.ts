'use client'

import { useState, useRef, useCallback } from 'react'

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      setStream(mediaStream)
      setIsStreaming(true)
      setError(null)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara')
      console.error('Camera error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsStreaming(false)
      
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream])

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    ctx.drawImage(videoRef.current, 0, 0)
    
    // Retornar imagen como base64
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  return {
    videoRef,
    stream,
    error,
    isStreaming,
    startCamera,
    stopCamera,
    captureImage
  }
}
