import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Get single guest with stay history
export async function GET(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Get guest
        const { data: huesped, error: guestError } = await supabase
            .from('huespedes')
            .select('*')
            .eq('id', id)
            .single()

        if (guestError || !huesped) {
            return NextResponse.json({ error: 'Huésped no encontrado' }, { status: 404 })
        }

        // Get stay history with room info
        const { data: estadias, error: estadiasError } = await supabase
            .from('estadias')
            .select(`
        id,
        fecha_checkin,
        fecha_checkout_real,
        estado,
        noches,
        total,
        habitacion:habitaciones(numero, tipo)
      `)
            .eq('huesped_id', id)
            .order('fecha_checkin', { ascending: false })

        // Get reservations
        const { data: reservas } = await supabase
            .from('reservas')
            .select('id, fecha_inicio, fecha_fin, estado, total_estimado')
            .eq('huesped_id', id)
            .order('fecha_inicio', { ascending: false })

        // Calculate totals
        const totalGastado = estadias?.reduce((sum, e) => sum + (e.total || 0), 0) || 0
        const totalEstadias = estadias?.length || 0
        const totalNoches = estadias?.reduce((sum, e) => sum + (e.noches || 0), 0) || 0

        return NextResponse.json({
            huesped,
            estadias: estadias || [],
            reservas: reservas || [],
            resumen: {
                total_gastado: totalGastado,
                total_estadias: totalEstadias,
                total_noches: totalNoches,
                es_vip: totalEstadias >= 3 || totalGastado >= 1000
            }
        })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update guest
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const {
            nombre, apellidos, telefono, email,
            procedencia, nacionalidad, es_extranjero,
            es_frecuente, notas
        } = body

        const updateData = {}
        if (nombre !== undefined) updateData.nombre = nombre
        if (apellidos !== undefined) updateData.apellidos = apellidos
        if (telefono !== undefined) updateData.telefono = telefono
        if (email !== undefined) updateData.email = email
        if (procedencia !== undefined) updateData.procedencia = procedencia
        if (nacionalidad !== undefined) updateData.nacionalidad = nacionalidad
        if (es_extranjero !== undefined) updateData.es_extranjero = es_extranjero
        if (es_frecuente !== undefined) updateData.es_frecuente = es_frecuente
        if (notas !== undefined) updateData.notas = notas

        const { data: huesped, error } = await supabase
            .from('huespedes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ huesped })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
