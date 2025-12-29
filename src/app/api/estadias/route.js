import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List active stays
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const estado = searchParams.get('estado') || 'activa'

        let query = supabase
            .from('estadias')
            .select(`
        *,
        huesped:huespedes(id, nombre, apellidos, tipo_documento, numero_documento, telefono, email, nacionalidad),
        habitacion:habitaciones(id, numero, tipo, piso, precio_base)
      `)
            .order('fecha_checkin', { ascending: false })

        if (estado !== 'todas') {
            query = query.eq('estado', estado)
        }

        const { data: estadias, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ estadias })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
