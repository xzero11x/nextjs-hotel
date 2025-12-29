import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// PATCH - Complete cleaning order and set room to available
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { estado, notas } = body

        // Get current order
        const { data: orden, error: fetchError } = await supabase
            .from('ordenes_servicio')
            .select('*, habitacion:habitaciones(id, numero)')
            .eq('id', id)
            .single()

        if (fetchError || !orden) {
            return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
        }

        // Update order
        const updateData = { estado: estado || 'completada' }
        if (notas) updateData.notas = orden.notas ? `${orden.notas}\n${notas}` : notas
        if (estado === 'completada') {
            updateData.fecha_completado = new Date().toISOString()
            updateData.atendido_por = user.id
        }

        const { data: updatedOrden, error: updateError } = await supabase
            .from('ordenes_servicio')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        // If completed, set room to 'disponible'
        if (estado === 'completada' && orden.habitacion) {
            const { error: roomError } = await supabase
                .from('habitaciones')
                .update({ estado: 'disponible' })
                .eq('id', orden.habitacion_id)

            if (roomError) {
                console.error('Error updating room:', roomError)
            }
        }

        return NextResponse.json({
            orden: updatedOrden,
            message: estado === 'completada'
                ? `Limpieza completada. Habitación ${orden.habitacion?.numero} disponible.`
                : 'Orden actualizada'
        })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE - Cancel cleaning order
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { error } = await supabase
            .from('ordenes_servicio')
            .update({ estado: 'cancelada' })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Orden cancelada' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
