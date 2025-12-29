import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Get single room
export async function GET(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: habitacion, error } = await supabase
            .from('habitaciones')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: 'Habitación no encontrada' }, { status: 404 })
        }

        return NextResponse.json({ habitacion })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update room
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { estado, tipo, precio_base, descripcion, amenidades, activa } = body

        const updateData = {}
        if (estado !== undefined) updateData.estado = estado
        if (tipo !== undefined) updateData.tipo = tipo
        if (precio_base !== undefined) updateData.precio_base = precio_base
        if (descripcion !== undefined) updateData.descripcion = descripcion
        if (amenidades !== undefined) updateData.amenidades = amenidades
        if (activa !== undefined) updateData.activa = activa

        const { data: habitacion, error } = await supabase
            .from('habitaciones')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ habitacion })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE - Soft delete room
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Check if admin
        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (currentUser?.rol !== 'administrador') {
            return NextResponse.json({ error: 'Solo administradores pueden eliminar habitaciones' }, { status: 403 })
        }

        // Soft delete
        const { error } = await supabase
            .from('habitaciones')
            .update({ activa: false })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Habitación desactivada' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
