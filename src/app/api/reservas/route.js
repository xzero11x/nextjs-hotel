import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List all reservations
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Get search params for filtering
        const { searchParams } = new URL(request.url)
        const estado = searchParams.get('estado')
        const desde = searchParams.get('desde')
        const hasta = searchParams.get('hasta')

        // Build query
        let query = supabase
            .from('reservas')
            .select(`
        *,
        habitacion:habitaciones(id, numero, tipo, piso, precio_base),
        huesped:huespedes(id, nombre, apellidos, tipo_documento, numero_documento, telefono, email)
      `)
            .order('fecha_inicio', { ascending: true })

        // Apply filters
        if (estado) {
            query = query.eq('estado', estado)
        }
        if (desde) {
            query = query.gte('fecha_inicio', desde)
        }
        if (hasta) {
            query = query.lte('fecha_fin', hasta)
        }

        const { data: reservas, error } = await query

        if (error) {
            console.error('Error fetching reservas:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ reservas })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST - Create new reservation
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const {
            habitacion_id,
            huesped_id,
            nombre_cliente,
            documento_cliente,
            telefono_cliente,
            email_cliente,
            fecha_inicio,
            fecha_fin,
            precio_noche,
            adelanto,
            origen,
            notas
        } = body

        // Validate required fields
        if (!habitacion_id || !fecha_inicio || !fecha_fin || !nombre_cliente) {
            return NextResponse.json({
                error: 'Habitación, fechas y nombre del cliente son requeridos'
            }, { status: 400 })
        }

        // Validate dates
        const inicio = new Date(fecha_inicio)
        const fin = new Date(fecha_fin)
        if (inicio >= fin) {
            return NextResponse.json({
                error: 'La fecha de inicio debe ser anterior a la fecha de fin'
            }, { status: 400 })
        }

        // Check availability using SQL function
        const { data: disponible, error: dispError } = await supabase
            .rpc('habitacion_disponible', {
                p_habitacion_id: habitacion_id,
                p_fecha_inicio: fecha_inicio,
                p_fecha_fin: fecha_fin
            })

        if (dispError) {
            console.error('Error checking availability:', dispError)
            return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
        }

        if (!disponible) {
            return NextResponse.json({
                error: 'La habitación no está disponible para las fechas seleccionadas'
            }, { status: 409 })
        }

        // Calculate nights and total
        const noches = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24))
        const total_estimado = precio_noche * noches

        // Create reservation
        const { data: reserva, error: insertError } = await supabase
            .from('reservas')
            .insert({
                habitacion_id,
                huesped_id: huesped_id || null,
                nombre_cliente,
                documento_cliente: documento_cliente || null,
                telefono_cliente: telefono_cliente || null,
                email_cliente: email_cliente || null,
                fecha_inicio,
                fecha_fin,
                estado: 'pendiente',
                precio_noche,
                total_estimado,
                adelanto: adelanto || 0,
                origen: origen || 'directo',
                notas: notas || null,
                registrado_por: user.id
            })
            .select(`
        *,
        habitacion:habitaciones(id, numero, tipo)
      `)
            .single()

        if (insertError) {
            console.error('Error creating reservation:', insertError)
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ reserva }, { status: 201 })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
