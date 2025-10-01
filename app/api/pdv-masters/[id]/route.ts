import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, address, city, region, phone, email, latitude, longitude } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del PDV es requerido' }, 
        { status: 400 }
      )
    }

    if (!name || !address || !city || !region) {
      return NextResponse.json(
        { error: 'Nombre, dirección, ciudad y región son requeridos' }, 
        { status: 400 }
      )
    }

    const pdvMaster = await prisma.pDVMaster.update({
      where: { id },
      data: {
        name,
        address,
        city,
        region,
        phone: phone || null,
        email: email || null,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0
      }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID del PDV es requerido' }, 
        { status: 400 }
      )
    }

    // Verificar si el PDV tiene clientes asociados
    const pdvWithClients = await prisma.pDVMaster.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clientPDVs: true
          }
        }
      }
    })

    if (!pdvWithClients) {
      return NextResponse.json(
        { error: 'PDV no encontrado' }, 
        { status: 404 }
      )
    }

    if (pdvWithClients._count.clientPDVs > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el PDV porque está asignado a ${pdvWithClients._count.clientPDVs} cliente(s)` }, 
        { status: 409 }
      )
    }

    // Eliminar el PDV
    await prisma.pDVMaster.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'PDV eliminado correctamente' })
  } catch (error: any) {
    console.error('Error deleting PDV master:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar PDV' }, 
      { status: 500 }
    )
  }
}
