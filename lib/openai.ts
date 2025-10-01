import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY no está configurado en las variables de entorno')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Tipos para las respuestas de IA
export interface ReceiptData {
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

export interface PriceData {
  productName: string
  price: number
  brand?: string
  confidence: number
}

export interface ExhibitionData {
  type: 'SHELF' | 'ENDCAP' | 'DISPLAY' | 'COOLER' | 'PROMOTIONAL'
  status: 'PENDING' | 'INSTALLED' | 'VERIFIED' | 'REMOVED'
  confidence: number
  items: string[]
}

export interface IncidentClassification {
  type: 'OUT_OF_STOCK' | 'EXPIRED_PRODUCT' | 'PRICING_ERROR' | 'DAMAGED_PRODUCT' | 'COMPETITOR_ACTIVITY' | 'OTHER'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  confidence: number
}

// Funciones de procesamiento de imágenes con GPT-4o Vision
export async function processReceipt(imageBase64: string): Promise<ReceiptData> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Eres un experto en OCR de boletas y facturas chilenas. Extrae la información estructurada de la boleta.
Responde SOLO con JSON válido siguiendo este formato:
{
  "total": number,
  "items": [{"name": string, "price": number, "quantity": number}],
  "confidence": number (0-1),
  "date": string (opcional),
  "store": string (opcional)
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: 'Extrae todos los datos de esta boleta/factura.'
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.1
  })

  const content = response.choices[0].message.content || '{}'
  return JSON.parse(content)
}

export async function analyzePrices(imageBase64: string): Promise<PriceData[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Eres un experto en análisis de precios en góndolas de supermercados y retail.
Identifica todos los productos visibles con sus precios.
Responde SOLO con JSON válido siguiendo este formato:
[
  {
    "productName": string,
    "price": number,
    "brand": string (opcional),
    "confidence": number (0-1)
  }
]`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: 'Identifica todos los productos y sus precios en esta imagen de góndola.'
          }
        ]
      }
    ],
    max_tokens: 2000,
    temperature: 0.1
  })

  const content = response.choices[0].message.content || '[]'
  return JSON.parse(content)
}

export async function detectExhibition(imageBase64: string): Promise<ExhibitionData> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Eres un experto en merchandising y exhibiciones de productos.
Analiza la imagen y determina el tipo de exhibición y su estado.
Responde SOLO con JSON válido siguiendo este formato:
{
  "type": "SHELF" | "ENDCAP" | "DISPLAY" | "COOLER" | "PROMOTIONAL",
  "status": "PENDING" | "INSTALLED" | "VERIFIED" | "REMOVED",
  "confidence": number (0-1),
  "items": [string] (productos visibles)
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: 'Analiza esta exhibición de productos.'
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.1
  })

  const content = response.choices[0].message.content || '{}'
  return JSON.parse(content)
}

export async function classifyIncident(imageBase64: string, description?: string): Promise<IncidentClassification> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Eres un experto en clasificación de incidencias en retail.
Analiza la imagen y clasifica el tipo de incidencia y su severidad.
Responde SOLO con JSON válido siguiendo este formato:
{
  "type": "OUT_OF_STOCK" | "EXPIRED_PRODUCT" | "PRICING_ERROR" | "DAMAGED_PRODUCT" | "COMPETITOR_ACTIVITY" | "OTHER",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "description": string,
  "confidence": number (0-1)
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: description ? `Analiza esta incidencia: ${description}` : 'Analiza esta incidencia.'
          }
        ]
      }
    ],
    max_tokens: 500,
    temperature: 0.1
  })

  const content = response.choices[0].message.content || '{}'
  return JSON.parse(content)
}
