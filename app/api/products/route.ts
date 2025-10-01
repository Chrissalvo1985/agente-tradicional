import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sku, name, category, brand, targetPrice } = body

    if (!sku || !name || !category || !brand || !targetPrice) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category,
        brand,
        targetPrice: parseFloat(targetPrice),
        isActive: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
