import { NextRequest, NextResponse } from 'next/server'
import { analyzePrices } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json()

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      )
    }

    // Remover el prefijo data:image si existe
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // Analizar precios con OpenAI
    const prices = await analyzePrices(base64Data)

    return NextResponse.json({ prices })
  } catch (error) {
    console.error('Error analyzing prices:', error)
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    )
  }
}
