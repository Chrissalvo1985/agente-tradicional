import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.taskTemplate.findMany({
      include: {
        _count: {
          select: {
            skuItems: true,
            checklistItems: true,
            assignments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      itemsCount: template.type === 'PRICE_AUDIT_SKU' 
        ? template._count.skuItems 
        : template._count.checklistItems,
      assignmentsCount: template._count.assignments,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }))

    return NextResponse.json(formattedTemplates)
  } catch (error) {
    console.error('Error fetching task templates:', error)
    return NextResponse.json({ error: 'Error al obtener plantillas' }, { status: 500 })
  }
}

// Crear nueva plantilla
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, type, items } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
    }

    const template = await prisma.taskTemplate.create({
      data: {
        name,
        description,
        type,
        ...(type === 'PRICE_AUDIT_SKU' && items && {
          skuItems: {
            create: items.map((item: any, index: number) => ({
              productId: item.productId,
              order: index,
              isRequired: item.isRequired ?? true
            }))
          }
        }),
        ...(type === 'EXHIBITION_CHECKLIST' && items && {
          checklistItems: {
            create: items.map((item: any, index: number) => ({
              name: item.name,
              description: item.description,
              order: index,
              requiresPhoto: item.requiresPhoto ?? true,
              isRequired: item.isRequired ?? true
            }))
          }
        })
      },
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

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating task template:', error)
    return NextResponse.json({ error: 'Error al crear plantilla' }, { status: 500 })
  }
}

// Obtener detalles de una plantilla con sus items
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { templateId } = body

    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
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

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template details:', error)
    return NextResponse.json({ error: 'Error al obtener detalles de plantilla' }, { status: 500 })
  }
}

