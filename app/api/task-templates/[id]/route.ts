import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Obtener detalles de una plantilla específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.taskTemplate.findUnique({
      where: { id: params.id },
      include: {
        skuItems: {
          include: {
            product: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        checklistItems: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            tasks: true,
            assignments: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ error: 'Error al obtener plantilla' }, { status: 500 })
  }
}

// Actualizar plantilla
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, type, items, isActive } = body

    // Verificar si la plantilla existe
    const existingTemplate = await prisma.taskTemplate.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    // Actualizar plantilla
    const template = await prisma.taskTemplate.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(type && { type })
      }
    })

    // Si se proporcionan items, actualizar los items
    if (items && type) {
      // Eliminar items existentes
      if (type === 'PRICE_AUDIT_SKU') {
        await prisma.sKUTemplateItem.deleteMany({
          where: { templateId: params.id }
        })
      } else if (type === 'EXHIBITION_CHECKLIST') {
        await prisma.checklistTemplateItem.deleteMany({
          where: { templateId: params.id }
        })
      }

      // Crear nuevos items
      if (type === 'PRICE_AUDIT_SKU' && items.length > 0) {
        await prisma.sKUTemplateItem.createMany({
          data: items.map((item: any, index: number) => ({
            templateId: params.id,
            productId: item.productId,
            order: index,
            isRequired: item.isRequired ?? true
          }))
        })
      } else if (type === 'EXHIBITION_CHECKLIST' && items.length > 0) {
        await prisma.checklistTemplateItem.createMany({
          data: items.map((item: any, index: number) => ({
            templateId: params.id,
            name: item.name,
            description: item.description,
            order: index,
            requiresPhoto: item.requiresPhoto ?? true,
            isRequired: item.isRequired ?? true
          }))
        })
      }
    }

    // Obtener la plantilla actualizada con sus items
    const updatedTemplate = await prisma.taskTemplate.findUnique({
      where: { id: params.id },
      include: {
        skuItems: {
          include: {
            product: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        checklistItems: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Error al actualizar plantilla' }, { status: 500 })
  }
}

// Eliminar plantilla
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si la plantilla existe
    const existingTemplate = await prisma.taskTemplate.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    // Verificar si tiene tareas asociadas
    if (existingTemplate._count.tasks > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar la plantilla porque tiene tareas asociadas' 
      }, { status: 400 })
    }

    // Eliminar plantilla (los items se eliminan por cascade)
    await prisma.taskTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Plantilla eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Error al eliminar plantilla' }, { status: 500 })
  }
}

// Activar/Desactivar plantilla
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive debe ser un booleano' }, { status: 400 })
    }

    const template = await prisma.taskTemplate.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating template status:', error)
    return NextResponse.json({ error: 'Error al actualizar estado de plantilla' }, { status: 500 })
  }
}
