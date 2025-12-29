import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List all seasons
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: temporadas, error } = await supabase
            .from('temporadas')
            .select('*')
            .order('fecha_inicio', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get current season
        const { data: temporadaActual } = await supabase.rpc('obtener_temporada_actual')

        return NextResponse.json({
            temporadas,
            temporada_actual: temporadaActual || 'media'
        })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Create new season
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { nombre, fecha_inicio, fecha_fin, tipo, multiplicador } = body

        if (!nombre || !fecha_inicio || !fecha_fin) {
            return NextResponse.json({ error: 'Nombre y fechas son requeridos' }, { status: 400 })
        }

        const { data: temporada, error } = await supabase
            .from('temporadas')
            .insert({
                nombre,
                fecha_inicio,
                fecha_fin,
                tipo: tipo || 'media',
                multiplicador: multiplicador || 1.00,
                activo: true
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ temporada }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
