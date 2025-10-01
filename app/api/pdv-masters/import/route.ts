import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

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
    const expectedHeaders = ['nombre', 'direccion', 'ciudad', 'region', 'telefono', 'email', 'latitud', 'longitud', 'codigo_postal', 'activo']
    
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
        const direccion = row[1]?.toString().trim()
        const ciudad = row[2]?.toString().trim()
        const region = row[3]?.toString().trim()
        const telefono = row[4]?.toString().trim() || null
        const email = row[5]?.toString().trim() || null
        const latitud = row[6]?.toString().trim()
        const longitud = row[7]?.toString().trim()
        const codigoPostal = row[8]?.toString().trim() || null
        const activo = row[9]?.toString().toLowerCase().trim()

        // Validaciones
        if (!nombre) {
          results.errors.push(`Fila ${i + 1}: El nombre es requerido`)
          continue
        }

        if (!direccion) {
          results.errors.push(`Fila ${i + 1}: La dirección es requerida`)
          continue
        }

        if (!ciudad) {
          results.errors.push(`Fila ${i + 1}: La ciudad es requerida`)
          continue
        }

        if (!region) {
          results.errors.push(`Fila ${i + 1}: La región es requerida`)
          continue
        }

        // Validar email si se proporciona
        if (email && !email.includes('@')) {
          results.errors.push(`Fila ${i + 1}: El email no es válido`)
          continue
        }

        // Validar coordenadas si se proporcionan
        let latitude = 0
        let longitude = 0

        if (latitud) {
          const lat = parseFloat(latitud)
          if (isNaN(lat) || lat < -90 || lat > 90) {
            results.errors.push(`Fila ${i + 1}: La latitud debe ser un número entre -90 y 90`)
            continue
          }
          latitude = lat
        }

        if (longitud) {
          const lng = parseFloat(longitud)
          if (isNaN(lng) || lng < -180 || lng > 180) {
            results.errors.push(`Fila ${i + 1}: La longitud debe ser un número entre -180 y 180`)
            continue
          }
          longitude = lng
        }

        // Crear PDV
        await prisma.pDVMaster.create({
          data: {
            name: nombre,
            address: direccion,
            city: ciudad,
            region: region,
            phone: telefono,
            email: email,
            latitude: latitude,
            longitude: longitude,
            postalCode: codigoPostal,
            isActive: activo === 'si' || activo === 'sí' || activo === 'true' || activo === '1'
          }
        })

        results.success++

      } catch (error) {
        results.errors.push(`Fila ${i + 1}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    return NextResponse.json({
      message: `Importación completada. ${results.success} de ${results.total} PDVs importados correctamente.`,
      results
    })

  } catch (error) {
    console.error('Error importing PDV masters:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar el archivo' 
    }, { status: 500 })
  }
}

export async function GET() {
  // Endpoint para descargar plantilla
  const templateData = [
    ['nombre', 'direccion', 'ciudad', 'region', 'telefono', 'email', 'latitud', 'longitud', 'codigo_postal', 'activo'],
    ['Almacén El Sol', 'Av. Principal 123', 'Santiago', 'Metropolitana', '+56912345678', 'contacto@elsol.cl', '-33.4489', '-70.6693', '7500000', 'si'],
    ['Supermercado Central', 'Calle Central 456', 'Valparaíso', 'Valparaíso', '+56987654321', 'info@central.cl', '-33.0458', '-71.6197', '2340000', 'si'],
    ['Mini Market Norte', 'Av. Norte 789', 'Antofagasta', 'Antofagasta', '', '', '-23.6509', '-70.3975', '1240000', 'no']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PDVs')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_pdvs.xlsx"'
    }
  })
}
