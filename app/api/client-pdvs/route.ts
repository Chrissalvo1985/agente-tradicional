import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const where = clientId ? { clientId } : {}

    const clientPDVs = await prisma.clientPDV.findMany({
      where,
      include: {
        pdvMaster: true,
        client: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        pdvMaster: {
          name: 'asc'
        }
      }
    })

    const formattedPDVs = clientPDVs.map(cpdv => ({
      id: cpdv.id,
      clientId: cpdv.clientId,
      clientName: cpdv.client.name,
      pdvMasterId: cpdv.pdvMasterId,
      name: cpdv.pdvMaster.name,
      address: cpdv.pdvMaster.address,
      city: cpdv.pdvMaster.city,
      region: cpdv.pdvMaster.region,
      latitude: cpdv.pdvMaster.latitude,
      longitude: cpdv.pdvMaster.longitude,
      level: cpdv.level,
      isActive: cpdv.isActive
    }))

    return NextResponse.json(formattedPDVs)
  } catch (error: any) {
    console.error('Error fetching client PDVs:', error)
    return NextResponse.json({ 
      error: 'Error al obtener PDVs del cliente',
      details: error.message 
    }, { status: 500 })
  }
}

