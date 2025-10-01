import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Obtener total de registros para paginación
    const total = await prisma.pDVMaster.count()

    const pdvMasters = await prisma.pDVMaster.findMany({
      include: {
        _count: {
          select: {
            clientPDVs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    })

    const formattedPDVs = pdvMasters.map(pdv => ({
      id: pdv.id,
      name: pdv.name,
      address: pdv.address,
      city: pdv.city,
      region: pdv.region,
      phone: pdv.phone,
      email: pdv.email,
      latitude: pdv.latitude,
      longitude: pdv.longitude,
      isActive: pdv.isActive,
      clientsCount: pdv._count.clientPDVs
    }))

    return NextResponse.json({
      data: formattedPDVs,
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
    console.error('Error fetching PDV masters:', error)
    return NextResponse.json({ 
      error: 'Error al obtener PDVs',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, city, region, phone, email, latitude, longitude } = body

    const pdvMaster = await prisma.pDVMaster.create({
      data: {
        name,
        address,
        city,
        region,
        phone,
        email,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        isActive: true
      }
    })

    return NextResponse.json(pdvMaster)
  } catch (error) {
    console.error('Error creating PDV master:', error)
    return NextResponse.json({ error: 'Error al crear PDV' }, { status: 500 })
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

    const pdvMaster = await prisma.pDVMaster.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json(pdvMaster)
  } catch (error: any) {
    console.error('Error updating PDV master:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar PDV' }, 
      { status: 500 }
    )
  }
}

