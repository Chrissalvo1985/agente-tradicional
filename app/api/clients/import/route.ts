import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Solo se permiten archivos Excel (.xlsx, .xls)' }, { status: 400 })
    }

    // Leer archivo Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    if (data.length < 2) {
      return NextResponse.json({ error: 'El archivo debe tener al menos una fila de encabezados y una fila de datos' }, { status: 400 })
    }

    // Obtener encabezados (primera fila)
    const headers = data[0] as string[]
    const expectedHeaders = ['nombre', 'codigo', 'descripcion', 'activo']
    
    // Validar encabezados
    const missingHeaders = expectedHeaders.filter(header => 
      !headers.some(h => h?.toLowerCase().trim() === header)
    )
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Faltan los siguientes encabezados requeridos: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    // Procesar datos
    const results = {
      success: 0,
      errors: [] as string[],
      total: 0
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[]
      if (!row || row.length === 0) continue

      results.total++

      try {
        const nombre = row[0]?.toString().trim()
        const codigo = row[1]?.toString().trim().toUpperCase()
        const descripcion = row[2]?.toString().trim() || null
        const activo = row[3]?.toString().toLowerCase().trim()

        // Validaciones
        if (!nombre) {
          results.errors.push(`Fila ${i + 1}: El nombre es requerido`)
          continue
        }

        if (!codigo) {
          results.errors.push(`Fila ${i + 1}: El código es requerido`)
          continue
        }

        // Verificar si el código ya existe
        const existingClient = await prisma.client.findUnique({
          where: { code: codigo }
        })

        if (existingClient) {
          results.errors.push(`Fila ${i + 1}: El código "${codigo}" ya existe`)
          continue
        }

        // Crear cliente
        await prisma.client.create({
          data: {
            name: nombre,
            code: codigo,
            description: descripcion,
            isActive: activo === 'si' || activo === 'sí' || activo === 'true' || activo === '1'
          }
        })

        results.success++

      } catch (error) {
        results.errors.push(`Fila ${i + 1}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    return NextResponse.json({
      message: `Importación completada. ${results.success} de ${results.total} clientes importados correctamente.`,
      results
    })

  } catch (error) {
    console.error('Error importing clients:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar el archivo' 
    }, { status: 500 })
  }
}

export async function GET() {
  // Endpoint para descargar plantilla
  const templateData = [
    ['nombre', 'codigo', 'descripcion', 'activo'],
    ['Coca-Cola Chile', 'CC-CL', 'Cliente principal de bebidas', 'si'],
    ['PepsiCo Chile', 'PE-CL', 'Cliente de bebidas competidor', 'si'],
    ['Nestlé Chile', 'NE-CL', 'Cliente de alimentos', 'no']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_clientes.xlsx"'
    }
  })
}
