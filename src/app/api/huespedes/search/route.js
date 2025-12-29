import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Search guests for autocomplete
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')

        if (!q || q.length < 2) {
            return NextResponse.json({ huespedes: [] })
        }

        // Search by document number, name, or surname
        const { data: huespedes, error } = await supabase
            .from('huespedes')
            .select('id, tipo_documento, numero_documento, nombre, apellidos, telefono, email, es_frecuente')
            .or(`numero_documento.ilike.%${q}%,nombre.ilike.%${q}%,apellidos.ilike.%${q}%`)
            .order('nombre')
            .limit(10)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ huespedes })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
