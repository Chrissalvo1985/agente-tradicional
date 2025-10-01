import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { clientId, agentId, scheduledDate, scheduledTime } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la asignación es requerido' }, 
        { status: 400 }
      )
    }

    if (!clientId || !agentId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Cliente, agente y fecha son requeridos' }, 
        { status: 400 }
      )
    }

    // Verificar que la ruta existe
    const existingRoute = await prisma.route.findUnique({
      where: { id }
    })

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' }, 
        { status: 404 }
      )
    }

    // Actualizar la ruta
    const route = await prisma.route.update({
      where: { id },
      data: {
        clientId,
        agentId,
        date: new Date(scheduledDate)
      }
    })

    return NextResponse.json(route)
  } catch (error: any) {
    console.error('Error updating route assignment:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar asignación' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la asignación es requerido' }, 
        { status: 400 }
      )
    }

    // Verificar que la ruta existe
    const existingRoute = await prisma.route.findUnique({
      where: { id }
    })

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' }, 
        { status: 404 }
      )
    }

    // Eliminar la ruta (esto también eliminará las tareas asociadas por cascade)
    await prisma.route.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Asignación eliminada correctamente' })
  } catch (error: any) {
    console.error('Error deleting route assignment:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar asignación' }, 
      { status: 500 }
    )
  }
}
