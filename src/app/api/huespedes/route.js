import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List all guests
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const documento = searchParams.get('documento')

        let query = supabase
            .from('huespedes')
            .select('*')
            .order('created_at', { ascending: false })

        if (documento) {
            query = query.eq('numero_documento', documento)
        }

        if (search) {
            query = query.or(`nombre.ilike.%${search}%,apellidos.ilike.%${search}%,numero_documento.ilike.%${search}%`)
        }

        const { data: huespedes, error } = await query.limit(50)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ huespedes })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Create or update guest (upsert by document)
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const {
            tipo_documento,
            numero_documento,
            nombre,
            apellidos,
            telefono,
            email,
            procedencia,
            nacionalidad,
            es_extranjero,
            fecha_nacimiento,
            notas
        } = body

        if (!numero_documento || !nombre) {
            return NextResponse.json({
                error: 'Número de documento y nombre son requeridos'
            }, { status: 400 })
        }

        // Check if guest already exists
        const { data: existing, error: searchError } = await supabase
            .from('huespedes')
            .select('id')
            .eq('tipo_documento', tipo_documento || 'DNI')
            .eq('numero_documento', numero_documento)
            .single()

        let huesped

        if (existing) {
            // Update existing guest
            const { data, error } = await supabase
                .from('huespedes')
                .update({
                    nombre,
                    apellidos: apellidos || null,
                    telefono: telefono || null,
                    email: email || null,
                    procedencia: procedencia || null,
                    nacionalidad: nacionalidad || 'Perú',
                    es_extranjero: es_extranjero || false,
                    fecha_nacimiento: fecha_nacimiento || null,
                    notas: notas || null
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            huesped = data
        } else {
            // Create new guest
            const { data, error } = await supabase
                .from('huespedes')
                .insert({
                    tipo_documento: tipo_documento || 'DNI',
                    numero_documento,
                    nombre,
                    apellidos: apellidos || null,
                    telefono: telefono || null,
                    email: email || null,
                    procedencia: procedencia || null,
                    nacionalidad: nacionalidad || 'Perú',
                    es_extranjero: es_extranjero || false,
                    fecha_nacimiento: fecha_nacimiento || null,
                    notas: notas || null
                })
                .select()
                .single()

            if (error) {
                // Handle duplicate key error
                if (error.code === '23505') {
                    return NextResponse.json({
                        error: 'Ya existe un huésped con ese documento'
                    }, { status: 409 })
                }
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            huesped = data
        }

        return NextResponse.json({ huesped, isNew: !existing }, { status: existing ? 200 : 201 })
    } catch (error) {
        console.error('Error creating guest:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
