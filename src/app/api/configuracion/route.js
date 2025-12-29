import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Get hotel and tax configuration
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Get hotel config
        const { data: hotelConfig } = await supabase
            .from('hotel_config')
            .select('*')
            .limit(1)
            .single()

        // Get tax config
        const { data: taxConfig } = await supabase
            .from('config_tributaria')
            .select('*')
            .limit(1)
            .single()

        return NextResponse.json({
            hotel: hotelConfig || null,
            tributaria: taxConfig || null
        })
    } catch (error) {
        console.error('Config error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update configuration
export async function PATCH(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Check admin role
        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (!['administrador', 'gerente'].includes(currentUser?.rol)) {
            return NextResponse.json({ error: 'Sin permisos para modificar configuración' }, { status: 403 })
        }

        const body = await request.json()
        const { tipo, ...data } = body

        if (tipo === 'hotel') {
            // Update hotel config
            const { data: existing } = await supabase
                .from('hotel_config')
                .select('id')
                .limit(1)
                .single()

            if (existing) {
                const { data: updated, error } = await supabase
                    .from('hotel_config')
                    .update({
                        nombre: data.nombre,
                        direccion: data.direccion,
                        telefono: data.telefono,
                        email: data.email,
                        hora_checkin: data.hora_checkin,
                        hora_checkout: data.hora_checkout,
                        moneda: data.moneda
                    })
                    .eq('id', existing.id)
                    .select()
                    .single()

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json({ hotel: updated, message: 'Configuración del hotel actualizada' })
            } else {
                // Create new
                const { data: created, error } = await supabase
                    .from('hotel_config')
                    .insert(data)
                    .select()
                    .single()

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json({ hotel: created, message: 'Configuración creada' })
            }
        } else if (tipo === 'tributaria') {
            // Update tax config
            const { data: existing } = await supabase
                .from('config_tributaria')
                .select('id')
                .limit(1)
                .single()

            if (existing) {
                const { data: updated, error } = await supabase
                    .from('config_tributaria')
                    .update({
                        ruc: data.ruc,
                        razon_social: data.razon_social,
                        nombre_comercial: data.nombre_comercial,
                        direccion_fiscal: data.direccion_fiscal,
                        ubigeo: data.ubigeo,
                        igv_porcentaje: data.igv_porcentaje,
                        es_zona_exonerada: data.es_zona_exonerada,
                        ley_exoneracion: data.ley_exoneracion,
                        serie_boleta: data.serie_boleta,
                        serie_factura: data.serie_factura
                    })
                    .eq('id', existing.id)
                    .select()
                    .single()

                if (error) {
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json({ tributaria: updated, message: 'Configuración tributaria actualizada' })
            }
        }

        return NextResponse.json({ error: 'Tipo de configuración no válido' }, { status: 400 })
    } catch (error) {
        console.error('Config update error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
