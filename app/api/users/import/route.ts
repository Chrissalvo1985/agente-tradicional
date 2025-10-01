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
    const expectedHeaders = ['nombre', 'email', 'rol', 'cliente_codigo', 'contraseña', 'activo']
    
    // Validar encabezados
    const missingHeaders = expectedHeaders.filter(header => 
      !headers.some(h => h?.toLowerCase().trim() === header)
    )
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Faltan los siguientes encabezados requeridos: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    // Obtener todos los clientes para validación
    const clients = await prisma.client.findMany({
      select: { id: true, code: true }
    })
    const clientCodeMap = new Map(clients.map(c => [c.code, c.id]))

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
        const email = row[1]?.toString().trim().toLowerCase()
        const rol = row[2]?.toString().trim().toUpperCase()
        const clienteCodigo = row[3]?.toString().trim().toUpperCase()
        const contraseña = row[4]?.toString().trim()
        const activo = row[5]?.toString().toLowerCase().trim()

        // Validaciones
        if (!nombre) {
          results.errors.push(`Fila ${i + 1}: El nombre es requerido`)
          continue
        }

        if (!email) {
          results.errors.push(`Fila ${i + 1}: El email es requerido`)
          continue
        }

        if (!email.includes('@')) {
          results.errors.push(`Fila ${i + 1}: El email no es válido`)
          continue
        }

        // Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          results.errors.push(`Fila ${i + 1}: El email "${email}" ya existe`)
          continue
        }

        // Validar rol
        const validRoles = ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER', 'AGENT']
        if (!validRoles.includes(rol)) {
          results.errors.push(`Fila ${i + 1}: El rol "${rol}" no es válido. Roles válidos: ${validRoles.join(', ')}`)
          continue
        }

        // Validar cliente (excepto para SUPER_ADMIN)
        let clientId = null
        if (rol !== 'SUPER_ADMIN') {
          if (!clienteCodigo) {
            results.errors.push(`Fila ${i + 1}: El código de cliente es requerido para el rol "${rol}"`)
            continue
          }

          clientId = clientCodeMap.get(clienteCodigo)
          if (!clientId) {
            results.errors.push(`Fila ${i + 1}: El cliente con código "${clienteCodigo}" no existe`)
            continue
          }
        }

        if (!contraseña || contraseña.length < 6) {
          results.errors.push(`Fila ${i + 1}: La contraseña debe tener al menos 6 caracteres`)
          continue
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 12)

        // Crear usuario
        await prisma.user.create({
          data: {
            name: nombre,
            email,
            password: hashedPassword,
            role: rol as any,
            clientId,
            isActive: activo === 'si' || activo === 'sí' || activo === 'true' || activo === '1'
          }
        })

        results.success++

      } catch (error) {
        results.errors.push(`Fila ${i + 1}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    return NextResponse.json({
      message: `Importación completada. ${results.success} de ${results.total} usuarios importados correctamente.`,
      results
    })

  } catch (error) {
    console.error('Error importing users:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar el archivo' 
    }, { status: 500 })
  }
}

export async function GET() {
  // Endpoint para descargar plantilla
  const templateData = [
    ['nombre', 'email', 'rol', 'cliente_codigo', 'contraseña', 'activo'],
    ['Juan Pérez', 'juan.perez@empresa.com', 'AGENT', 'CC-CL', 'password123', 'si'],
    ['María García', 'maria.garcia@empresa.com', 'ADMIN', 'PE-CL', 'password123', 'si'],
    ['Carlos López', 'carlos.lopez@empresa.com', 'STORE_KEEPER', 'NE-CL', 'password123', 'si'],
    ['Ana Admin', 'ana.admin@empresa.com', 'SUPER_ADMIN', '', 'password123', 'si']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_usuarios.xlsx"'
    }
  })
}
