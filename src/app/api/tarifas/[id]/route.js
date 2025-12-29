import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// PATCH - Update rate
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { nombre, precio_base, precio_fin_semana, temporada, activo, descripcion } = body

        const updateData = {}
        if (nombre !== undefined) updateData.nombre = nombre
        if (precio_base !== undefined) updateData.precio_base = precio_base
        if (precio_fin_semana !== undefined) updateData.precio_fin_semana = precio_fin_semana
        if (temporada !== undefined) updateData.temporada = temporada
        if (activo !== undefined) updateData.activo = activo
        if (descripcion !== undefined) updateData.descripcion = descripcion

        const { data: tarifa, error } = await supabase
            .from('tarifas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ tarifa })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE - Deactivate rate
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { error } = await supabase
            .from('tarifas')
            .update({ activo: false })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Tarifa desactivada' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
