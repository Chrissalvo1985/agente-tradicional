import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const where = clientId ? { clientId } : {}

    const agents = await prisma.agent.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        client: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.user.name || 'Sin nombre',
      email: agent.user.email,
      clientId: agent.clientId,
      clientName: agent.client?.name || null,
      isActive: agent.isActive
    }))

    return NextResponse.json(formattedAgents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ error: 'Error al obtener agentes' }, { status: 500 })
  }
}

