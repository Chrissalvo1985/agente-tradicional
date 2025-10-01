import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const templateId = formData.get('templateId') as string

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    if (!templateId) {
      return NextResponse.json({ error: 'ID de plantilla requerido' }, { status: 400 })
    }

    // Verificar que la plantilla existe y es de tipo PRICE_AUDIT_SKU
    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    if (template.type !== 'PRICE_AUDIT_SKU') {
      return NextResponse.json({ 
        error: 'Solo se pueden importar productos en plantillas de tipo PRICE_AUDIT_SKU' 
      }, { status: 400 })
    }

    // Leer el archivo Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 })
    }

    // Validar estructura del archivo
    const requiredColumns = ['sku', 'name', 'category', 'brand', 'targetPrice']
    const firstRow = data[0] as any
    const missingColumns = requiredColumns.filter(col => !(col in firstRow))

    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Faltan las siguientes columnas: ${missingColumns.join(', ')}` 
      }, { status: 400 })
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    }

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // +2 porque empezamos desde la fila 2 (1 es header)

      try {
        const sku = String(row.sku).trim()
        const name = String(row.name).trim()
        const category = String(row.category).trim()
        const brand = String(row.brand).trim()
        const targetPrice = parseFloat(row.targetPrice)

        if (!sku || !name || !category || !brand || isNaN(targetPrice)) {
          results.errors.push(`Fila ${rowNumber}: Datos incompletos o inválidos`)
          continue
        }

        // Buscar producto existente por SKU
        const existingProduct = await prisma.product.findUnique({
          where: { sku }
        })

        if (existingProduct) {
          // Actualizar producto existente
          await prisma.product.update({
            where: { sku },
            data: {
              name,
              category,
              brand,
              targetPrice,
              isActive: true
            }
          })
          results.updated++
        } else {
          // Crear nuevo producto
          await prisma.product.create({
            data: {
              sku,
              name,
              category,
              brand,
              targetPrice,
              isActive: true
            }
          })
          results.created++
        }
      } catch (error) {
        results.errors.push(`Fila ${rowNumber}: Error al procesar - ${error}`)
      }
    }

    // Obtener todos los productos activos para agregar a la plantilla
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    // Eliminar items existentes de la plantilla
    await prisma.sKUTemplateItem.deleteMany({
      where: { templateId }
    })

    // Agregar todos los productos a la plantilla
    if (allProducts.length > 0) {
      await prisma.sKUTemplateItem.createMany({
        data: allProducts.map((product, index) => ({
          templateId,
          productId: product.id,
          order: index,
          isRequired: true
        }))
      })
    }

    return NextResponse.json({
      message: 'Importación completada',
      results,
      productsAdded: allProducts.length
    })

  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json({ error: 'Error al importar productos' }, { status: 500 })
  }
}
