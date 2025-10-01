import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        client: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      clientName: user.client?.name || null,
      isActive: user.isActive
    }))

    return NextResponse.json(formattedUsers)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role, clientId, password } = body

    // Validación de campos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' }, 
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' }, 
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' }, 
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        clientId: clientId || null,
        password: hashedPassword,
        isActive: true
      }
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, email, role, clientId, password } = body

    // Validación de campos requeridos
    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'ID, nombre y email son requeridos' }, 
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      )
    }

    // Verificar si el email ya existe en otro usuario
    const emailExists = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'Ya existe otro usuario con ese email' }, 
        { status: 409 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {
      name,
      email,
      role,
      clientId: role === 'SUPER_ADMIN' ? null : clientId
    }

    // Solo actualizar contraseña si se proporciona
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres' }, 
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      clientId: updatedUser.clientId
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar usuario' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isActive } = body

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'ID del usuario y estado activo son requeridos' }, 
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      )
    }

    // Actualizar el estado activo del usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ 
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`,
      id: updatedUser.id,
      isActive: updatedUser.isActive
    })
  } catch (error: any) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar estado del usuario' }, 
      { status: 500 }
    )
  }
}

