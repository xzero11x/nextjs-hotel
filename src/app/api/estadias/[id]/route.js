import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Get single stay
export async function GET(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: estadia, error } = await supabase
            .from('estadias')
            .select(`
        *,
        huesped:huespedes(*),
        habitacion:habitaciones(*),
        reserva:reservas(id, fecha_inicio, fecha_fin, origen)
      `)
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 })
        }

        // Get payments for this stay
        const { data: pagos } = await supabase
            .from('pagos')
            .select('*')
            .eq('estadia_id', id)
            .order('created_at', { ascending: false })

        return NextResponse.json({ estadia, pagos: pagos || [] })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update stay (extend, add charges, etc.)
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
            fecha_checkout_prevista,
            noches,
            precio_noche,
            adultos,
            ninos,
            notas,
            estado_huesped
        } = body

        // Get current stay
        const { data: current, error: fetchError } = await supabase
            .from('estadias')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 })
        }

        // Prepare update
        const updateData = {}

        if (fecha_checkout_prevista) updateData.fecha_checkout_prevista = fecha_checkout_prevista
        if (noches) updateData.noches = noches
        if (precio_noche) updateData.precio_noche = precio_noche
        if (adultos !== undefined) updateData.adultos = adultos
        if (ninos !== undefined) updateData.ninos = ninos
        if (notas !== undefined) updateData.notas = notas
        if (estado_huesped) updateData.estado_huesped = estado_huesped

        // Recalculate totals if price or nights changed
        if (noches || precio_noche) {
            const nochesCalc = noches || current.noches
            const precioCalc = precio_noche || current.precio_noche
            const subtotal = nochesCalc * precioCalc
            const igv = subtotal * (current.igv_porcentaje / 100)

            updateData.subtotal = subtotal
            updateData.igv_monto = igv
            updateData.total = subtotal + igv
        }

        const { data: estadia, error } = await supabase
            .from('estadias')
            .update(updateData)
            .eq('id', id)
            .select(`
        *,
        huesped:huespedes(id, nombre, apellidos, numero_documento),
        habitacion:habitaciones(id, numero, tipo)
      `)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ estadia })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
