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
    const expectedHeaders = ['cliente_codigo', 'agente_email', 'fecha_programada', 'hora_programada']
    
    // Validar encabezados
    const missingHeaders = expectedHeaders.filter(header => 
      !headers.some(h => h?.toLowerCase().trim() === header)
    )
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Faltan los siguientes encabezados requeridos: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    // Obtener todos los clientes y agentes para validación
    const clients = await prisma.client.findMany({
      select: { id: true, code: true }
    })
    const clientCodeMap = new Map(clients.map(c => [c.code, c.id]))

    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: { email: true }
        }
      }
    })
    const agentEmailMap = new Map(agents.map(a => [a.user.email, a.id]))

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
        const clienteCodigo = row[0]?.toString().trim().toUpperCase()
        const agenteEmail = row[1]?.toString().trim().toLowerCase()
        const fechaProgramada = row[2]?.toString().trim()
        const horaProgramada = row[3]?.toString().trim() || '09:00'

        // Validaciones
        if (!clienteCodigo) {
          results.errors.push(`Fila ${i + 1}: El código de cliente es requerido`)
          continue
        }

        if (!agenteEmail) {
          results.errors.push(`Fila ${i + 1}: El email del agente es requerido`)
          continue
        }

        if (!fechaProgramada) {
          results.errors.push(`Fila ${i + 1}: La fecha programada es requerida`)
          continue
        }

        // Validar cliente
        const clientId = clientCodeMap.get(clienteCodigo)
        if (!clientId) {
          results.errors.push(`Fila ${i + 1}: El cliente con código "${clienteCodigo}" no existe`)
          continue
        }

        // Validar agente
        const agentId = agentEmailMap.get(agenteEmail)
        if (!agentId) {
          results.errors.push(`Fila ${i + 1}: El agente con email "${agenteEmail}" no existe`)
          continue
        }

        // Validar fecha
        const fecha = new Date(fechaProgramada)
        if (isNaN(fecha.getTime())) {
          results.errors.push(`Fila ${i + 1}: La fecha "${fechaProgramada}" no es válida`)
          continue
        }

        // Verificar que el agente pertenece al cliente
        const agent = agents.find(a => a.id === agentId)
        if (agent && agent.clientId !== clientId) {
          results.errors.push(`Fila ${i + 1}: El agente "${agenteEmail}" no pertenece al cliente "${clienteCodigo}"`)
          continue
        }

        // Crear asignación
        await prisma.route.create({
          data: {
            clientId,
            agentId,
            date: fecha,
            status: 'PLANNED'
          }
        })

        results.success++

      } catch (error) {
        results.errors.push(`Fila ${i + 1}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    return NextResponse.json({
      message: `Importación completada. ${results.success} de ${results.total} asignaciones importadas correctamente.`,
      results
    })

  } catch (error) {
    console.error('Error importing route assignments:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar el archivo' 
    }, { status: 500 })
  }
}

export async function GET() {
  // Endpoint para descargar plantilla
  const templateData = [
    ['cliente_codigo', 'agente_email', 'fecha_programada', 'hora_programada'],
    ['CC-CL', 'juan.perez@empresa.com', '2024-01-15', '09:00'],
    ['PE-CL', 'maria.garcia@empresa.com', '2024-01-16', '10:30'],
    ['NE-CL', 'carlos.lopez@empresa.com', '2024-01-17', '14:00']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planificaciones')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_planificaciones.xlsx"'
    }
  })
}
