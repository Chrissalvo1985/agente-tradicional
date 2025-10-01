'use client'

import { useEffect } from 'react'
import { useCamera } from '@/hooks/use-camera'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, X, Loader2, AlertCircle } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { videoRef, isStreaming, error, startCamera, stopCamera, captureImage } = useCamera()

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const handleCapture = () => {
    const image = captureImage()
    if (image) {
      onCapture(image)
      stopCamera()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="safe-area-inset bg-black/80 backdrop-blur p-4 flex items-center justify-between">
        <h2 className="text-white font-semibold">Capturar Imagen</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="m-4 p-6 max-w-sm">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-center text-sm">{error}</p>
              <Button
                className="w-full mt-4"
                onClick={startCamera}
              >
                Intentar nuevamente
              </Button>
            </Card>
          </div>
        ) : !isStreaming ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay Guide */}
        {isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-4 border-white/50 rounded-lg w-[80%] aspect-video"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="safe-area-inset bg-black/80 backdrop-blur p-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={handleCapture}
            disabled={!isStreaming}
            className="w-16 h-16 rounded-full bg-white hover:bg-white/90"
          >
            <Camera className="h-8 w-8 text-black" />
          </Button>
        </div>
        <p className="text-center text-white/70 text-sm mt-4">
          Centra la góndola o boleta en el marco
        </p>
      </div>
    </div>
  )
}
