import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Get single reservation
export async function GET(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: reserva, error } = await supabase
            .from('reservas')
            .select(`
        *,
        habitacion:habitaciones(id, numero, tipo, piso, precio_base),
        huesped:huespedes(id, nombre, apellidos, tipo_documento, numero_documento, telefono, email)
      `)
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
        }

        return NextResponse.json({ reserva })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update reservation
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { estado, notas, adelanto } = body

        // Get current reservation
        const { data: current, error: fetchError } = await supabase
            .from('reservas')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
        }

        // Prepare update data
        const updateData = {}
        if (estado) updateData.estado = estado
        if (notas !== undefined) updateData.notas = notas
        if (adelanto !== undefined) updateData.adelanto = adelanto

        const { data: reserva, error } = await supabase
            .from('reservas')
            .update(updateData)
            .eq('id', id)
            .select(`
        *,
        habitacion:habitaciones(id, numero, tipo)
      `)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ reserva })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE - Cancel reservation (soft delete by changing state)
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Soft delete - change state to cancelled
        const { error } = await supabase
            .from('reservas')
            .update({ estado: 'cancelada' })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Reserva cancelada' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
