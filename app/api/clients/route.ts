import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            pdvs: true,
            agents: true,
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      code: client.code,
      description: client.description,
      isActive: client.isActive,
      pdvCount: client._count.pdvs,
      agentCount: client._count.agents,
      userCount: client._count.users
    }))

    return NextResponse.json(formattedClients)
  } catch (error: any) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ 
      error: 'Error al obtener clientes',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, code, description } = body

    // Validación básica
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nombre y código son requeridos' }, 
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    const existingClient = await prisma.client.findUnique({
      where: { code }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese código' }, 
        { status: 409 }
      )
    }

    const client = await prisma.client.create({
      data: {
        name,
        code,
        description: description || null,
        isActive: true
      }
    })

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al crear cliente' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isActive } = body

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'ID y estado activo son requeridos' }, 
        { status: 400 }
      )
    }

    const client = await prisma.client.update({
      where: { id },
      data: { isActive }
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
