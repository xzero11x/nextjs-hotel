import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Dynamic Pricing Engine
 * 
 * Calculates suggested price based on:
 * 1. Room base price
 * 2. Current season (from SQL function)
 * 3. Season multiplier
 * 4. Weekend adjustment (optional)
 */
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const habitacion_id = searchParams.get('habitacion_id')
        const tipo_habitacion = searchParams.get('tipo_habitacion')
        const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]

        // Get current season type using SQL function
        const { data: temporadaData, error: tempError } = await supabase
            .rpc('obtener_temporada_actual')

        const temporadaTipo = temporadaData || 'media'

        // Get season details (multiplier)
        const { data: temporada } = await supabase
            .from('temporadas')
            .select('nombre, tipo, multiplicador')
            .eq('tipo', temporadaTipo)
            .eq('activo', true)
            .gte('fecha_fin', fecha)
            .lte('fecha_inicio', fecha)
            .single()

        const multiplicador = temporada?.multiplicador || 1.00

        // Get pricing based on room or type
        let precioBase = 0
        let habitacionInfo = null

        if (habitacion_id) {
            // Get room specific price
            const { data: room } = await supabase
                .from('habitaciones')
                .select('id, numero, tipo, precio_base')
                .eq('id', habitacion_id)
                .single()

            if (room) {
                precioBase = room.precio_base
                habitacionInfo = room
            }
        } else if (tipo_habitacion) {
            // Get price from tarifas table
            const { data: tarifa } = await supabase
                .from('tarifas')
                .select('*')
                .eq('tipo_habitacion', tipo_habitacion)
                .eq('activo', true)
                .single()

            if (tarifa) {
                // Use season-specific price
                switch (temporadaTipo) {
                    case 'baja':
                        precioBase = tarifa.precio_temporada_baja || tarifa.precio_base;
                        break;
                    case 'alta':
                        precioBase = tarifa.precio_temporada_alta || tarifa.precio_base;
                        break;
                    default:
                        precioBase = tarifa.precio_temporada_media || tarifa.precio_base;
                }
            }
        }

        // Check if date is weekend (Friday, Saturday)
        const dateObj = new Date(fecha)
        const dayOfWeek = dateObj.getDay()
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Friday or Saturday
        const weekendMultiplier = isWeekend ? 1.10 : 1.00 // 10% weekend surcharge

        // Calculate suggested price
        const precioSugerido = precioBase * multiplicador * weekendMultiplier

        return NextResponse.json({
            fecha,
            temporada: {
                tipo: temporadaTipo,
                nombre: temporada?.nombre || `Temporada ${temporadaTipo}`,
                multiplicador
            },
            habitacion: habitacionInfo,
            precios: {
                base: precioBase,
                multiplicador_temporada: multiplicador,
                multiplicador_fin_semana: weekendMultiplier,
                es_fin_semana: isWeekend,
                sugerido: Math.round(precioSugerido * 100) / 100
            }
        })
    } catch (error) {
        console.error('Pricing error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Calculate price for date range
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { habitacion_id, tipo_habitacion, fecha_inicio, fecha_fin } = await request.json()

        if (!fecha_inicio || !fecha_fin) {
            return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 })
        }

        // Get base price
        let precioBase = 0

        if (habitacion_id) {
            const { data: room } = await supabase
                .from('habitaciones')
                .select('precio_base, tipo')
                .eq('id', habitacion_id)
                .single()
            precioBase = room?.precio_base || 0
        } else if (tipo_habitacion) {
            const { data: tarifa } = await supabase
                .from('tarifas')
                .select('precio_base')
                .eq('tipo_habitacion', tipo_habitacion)
                .single()
            precioBase = tarifa?.precio_base || 0
        }

        // Get current season
        const { data: temporadaTipo } = await supabase.rpc('obtener_temporada_actual')

        const { data: temporada } = await supabase
            .from('temporadas')
            .select('multiplicador')
            .eq('tipo', temporadaTipo || 'media')
            .eq('activo', true)
            .single()

        const multiplicador = temporada?.multiplicador || 1.00

        // Calculate nights
        const inicio = new Date(fecha_inicio)
        const fin = new Date(fecha_fin)
        const noches = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24))

        // Calculate price per night with weekend detection
        let totalSugerido = 0
        const detalleNoches = []

        for (let i = 0; i < noches; i++) {
            const currentDate = new Date(inicio)
            currentDate.setDate(inicio.getDate() + i)
            const dayOfWeek = currentDate.getDay()
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
            const weekendMult = isWeekend ? 1.10 : 1.00
            const precioNoche = precioBase * multiplicador * weekendMult

            detalleNoches.push({
                fecha: currentDate.toISOString().split('T')[0],
                precio: Math.round(precioNoche * 100) / 100,
                es_fin_semana: isWeekend
            })

            totalSugerido += precioNoche
        }

        return NextResponse.json({
            temporada: temporadaTipo || 'media',
            multiplicador,
            noches,
            precio_base: precioBase,
            precio_promedio_noche: Math.round((totalSugerido / noches) * 100) / 100,
            total_sugerido: Math.round(totalSugerido * 100) / 100,
            detalle: detalleNoches
        })
    } catch (error) {
        console.error('Pricing error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
