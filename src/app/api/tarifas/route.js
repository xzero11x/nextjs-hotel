import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List all rates
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const tipo_habitacion = searchParams.get('tipo_habitacion')
        const activo = searchParams.get('activo')

        let query = supabase
            .from('tarifas')
            .select('*')
            .order('tipo_habitacion')

        if (tipo_habitacion) query = query.eq('tipo_habitacion', tipo_habitacion)
        if (activo !== null) query = query.eq('activo', activo === 'true')

        const { data: tarifas, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ tarifas })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Create new rate
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (!['administrador', 'gerente'].includes(currentUser?.rol)) {
            return NextResponse.json({ error: 'Sin permisos para gestionar tarifas' }, { status: 403 })
        }

        const body = await request.json()
        const {
            nombre,
            tipo_habitacion,
            precio_base,
            precio_fin_semana,
            temporada,
            descripcion
        } = body

        if (!nombre || !tipo_habitacion || !precio_base) {
            return NextResponse.json({ error: 'Nombre, tipo y precio base son requeridos' }, { status: 400 })
        }

        const { data: tarifa, error } = await supabase
            .from('tarifas')
            .insert({
                nombre,
                tipo_habitacion,
                precio_base,
                precio_fin_semana: precio_fin_semana || precio_base,
                temporada: temporada || 'normal',
                descripcion: descripcion || null,
                activo: true
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ tarifa }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
