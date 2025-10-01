import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, code, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del cliente es requerido' }, 
        { status: 400 }
      )
    }

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nombre y código son requeridos' }, 
        { status: 400 }
      )
    }

    // Verificar si el código ya existe en otro cliente
    const existingClient = await prisma.client.findFirst({
      where: { 
        code,
        NOT: { id }
      }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe otro cliente con ese código' }, 
        { status: 409 }
      )
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        code,
        description: description || null
      }
    })

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar cliente' }, 
      { status: 500 }
    )
  }
}
