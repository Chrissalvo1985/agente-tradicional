import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = clientId ? { clientId } : {}

    // Obtener total de registros para paginación
    const total = await prisma.route.count({ where })

    const assignments = await prisma.route.findMany({
      where,
      include: {
        client: {
          select: {
            name: true
          }
        },
        agent: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: limit
    })

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      clientId: assignment.clientId,
      clientName: assignment.client.name,
      pdvId: 'N/A', // El modelo Route no tiene clientPDVId directo
      pdvName: 'N/A', // Se necesita obtener de las tareas
      agentId: assignment.agentId,
      agentName: assignment.agent?.user?.name || 'Sin asignar',
      tasksCount: assignment._count.tasks,
      scheduledDate: assignment.date.toISOString().split('T')[0],
      scheduledTime: '09:00', // El modelo no tiene scheduledTime
      status: assignment.status
    }))

    return NextResponse.json({
      data: formattedAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error: any) {
    console.error('Error fetching route assignments:', error)
    return NextResponse.json({ 
      error: 'Error al obtener asignaciones de rutas',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, agentId, scheduledDate, taskTemplateIds } = body

    // Validación básica
    if (!clientId || !agentId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Cliente, agente y fecha son requeridos' }, 
        { status: 400 }
      )
    }

    // Crear la ruta
    const route = await prisma.route.create({
      data: {
        clientId,
        agentId,
        date: new Date(scheduledDate),
        status: 'PLANNED'
      }
    })

    return NextResponse.json(route)
  } catch (error: any) {
    console.error('Error creating route assignment:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al crear asignación de ruta' }, 
      { status: 500 }
    )
  }
}
