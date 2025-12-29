import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List cleaning orders
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const estado = searchParams.get('estado')

        let query = supabase
            .from('ordenes_servicio')
            .select(`
        *,
        habitacion:habitaciones(id, numero, tipo, piso, estado)
      `)
            .in('tipo_servicio', ['limpieza_checkout', 'limpieza_programada', 'limpieza'])
            .order('created_at', { ascending: false })

        if (estado) {
            query = query.eq('estado', estado)
        }

        const { data: ordenes, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ordenes })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Create cleaning order
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { habitacion_id, tipo_servicio, prioridad, notas } = await request.json()

        if (!habitacion_id) {
            return NextResponse.json({ error: 'habitacion_id es requerido' }, { status: 400 })
        }

        const { data: orden, error } = await supabase
            .from('ordenes_servicio')
            .insert({
                habitacion_id,
                tipo_servicio: tipo_servicio || 'limpieza_programada',
                estado: 'pendiente',
                prioridad: prioridad || 'normal',
                notas: notas || null,
                solicitado_por: user.id
            })
            .select(`
        *,
        habitacion:habitaciones(id, numero, tipo)
      `)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ orden }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
