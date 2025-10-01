import { NextRequest, NextResponse } from 'next/server'
import { processReceipt } from '@/lib/openai'

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

    // Procesar boleta con OpenAI
    const receipt = await processReceipt(base64Data)

    return NextResponse.json({ receipt })
  } catch (error) {
    console.error('Error processing receipt:', error)
    return NextResponse.json(
      { error: 'Error al procesar la boleta' },
      { status: 500 }
    )
  }
}
