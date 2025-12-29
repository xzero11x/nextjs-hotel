import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Check room availability for specific dates
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const habitacion_id = searchParams.get('habitacion_id')
        const fecha_inicio = searchParams.get('fecha_inicio')
        const fecha_fin = searchParams.get('fecha_fin')

        if (!habitacion_id || !fecha_inicio || !fecha_fin) {
            return NextResponse.json({
                error: 'habitacion_id, fecha_inicio y fecha_fin son requeridos'
            }, { status: 400 })
        }

        // Use SQL function to check availability
        const { data: disponible, error } = await supabase
            .rpc('habitacion_disponible', {
                p_habitacion_id: habitacion_id,
                p_fecha_inicio: fecha_inicio,
                p_fecha_fin: fecha_fin
            })

        if (error) {
            console.error('Error checking availability:', error)
            return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
        }

        return NextResponse.json({
            disponible,
            habitacion_id,
            fecha_inicio,
            fecha_fin
        })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST - Check multiple rooms availability
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { fecha_inicio, fecha_fin } = await request.json()

        if (!fecha_inicio || !fecha_fin) {
            return NextResponse.json({
                error: 'fecha_inicio y fecha_fin son requeridos'
            }, { status: 400 })
        }

        // Get all rooms
        const { data: habitaciones, error: habError } = await supabase
            .from('habitaciones')
            .select('id, numero, tipo, capacidad, piso, estado, precio_base')
            .eq('activa', true)
            .order('numero')

        if (habError) {
            return NextResponse.json({ error: habError.message }, { status: 500 })
        }

        // Check availability for each room
        const disponibilidad = await Promise.all(
            habitaciones.map(async (hab) => {
                const { data: disponible } = await supabase
                    .rpc('habitacion_disponible', {
                        p_habitacion_id: hab.id,
                        p_fecha_inicio: fecha_inicio,
                        p_fecha_fin: fecha_fin
                    })

                return {
                    ...hab,
                    disponible: disponible ?? false
                }
            })
        )

        return NextResponse.json({
            habitaciones: disponibilidad,
            fecha_inicio,
            fecha_fin
        })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
