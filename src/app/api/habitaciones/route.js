import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List all rooms
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const estado = searchParams.get('estado')
        const tipo = searchParams.get('tipo')
        const piso = searchParams.get('piso')

        let query = supabase
            .from('habitaciones')
            .select('*')
            .eq('activa', true)
            .order('numero')

        if (estado) query = query.eq('estado', estado)
        if (tipo) query = query.eq('tipo', tipo)
        if (piso) query = query.eq('piso', piso)

        const { data: habitaciones, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ habitaciones })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Create new room
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Check if admin
        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (currentUser?.rol !== 'administrador') {
            return NextResponse.json({ error: 'Solo administradores pueden crear habitaciones' }, { status: 403 })
        }

        const body = await request.json()
        const { numero, tipo, capacidad, piso, precio_base, descripcion, amenidades } = body

        if (!numero || !tipo || !precio_base) {
            return NextResponse.json({ error: 'Número, tipo y precio son requeridos' }, { status: 400 })
        }

        // Check if room number already exists
        const { data: existing } = await supabase
            .from('habitaciones')
            .select('id')
            .eq('numero', numero)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Ya existe una habitación con ese número' }, { status: 409 })
        }

        const { data: habitacion, error } = await supabase
            .from('habitaciones')
            .insert({
                numero,
                tipo,
                capacidad: capacidad || 1,
                piso: piso || 1,
                estado: 'disponible',
                precio_base,
                descripcion: descripcion || null,
                amenidades: amenidades || [],
                activa: true
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ habitacion }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
