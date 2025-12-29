import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * CHECK-IN Process
 * 
 * 1. Create/update guest in huespedes table
 * 2. If from reservation, update reserva estado to 'checkin'
 * 3. Create estadia record
 * 4. Update habitacion estado to 'ocupada'
 */
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const {
            // Guest data
            tipo_documento,
            numero_documento,
            nombre,
            apellidos,
            telefono,
            email,
            procedencia,
            nacionalidad,
            es_extranjero,
            // Stay data
            habitacion_id,
            reserva_id,
            fecha_checkout_prevista,
            precio_noche,
            noches,
            adultos,
            ninos,
            notas
        } = body

        // Validate required fields
        if (!numero_documento || !nombre) {
            return NextResponse.json({
                error: 'Documento y nombre del huésped son requeridos'
            }, { status: 400 })
        }

        if (!habitacion_id || !fecha_checkout_prevista || !precio_noche) {
            return NextResponse.json({
                error: 'Habitación, fecha de salida y precio son requeridos'
            }, { status: 400 })
        }

        // Step 1: Create or update guest
        let huesped_id

        const { data: existingGuest } = await supabase
            .from('huespedes')
            .select('id')
            .eq('tipo_documento', tipo_documento || 'DNI')
            .eq('numero_documento', numero_documento)
            .single()

        if (existingGuest) {
            // Update existing guest
            const { error: updateError } = await supabase
                .from('huespedes')
                .update({
                    nombre,
                    apellidos: apellidos || null,
                    telefono: telefono || null,
                    email: email || null,
                    procedencia: procedencia || null,
                    nacionalidad: nacionalidad || 'Perú',
                    es_extranjero: es_extranjero || false
                })
                .eq('id', existingGuest.id)

            if (updateError) {
                return NextResponse.json({ error: 'Error actualizando huésped: ' + updateError.message }, { status: 500 })
            }
            huesped_id = existingGuest.id
        } else {
            // Create new guest
            const { data: newGuest, error: createError } = await supabase
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
                    es_extranjero: es_extranjero || false
                })
                .select('id')
                .single()

            if (createError) {
                if (createError.code === '23505') {
                    return NextResponse.json({
                        error: 'Documento duplicado. Ya existe un huésped con ese número.'
                    }, { status: 409 })
                }
                return NextResponse.json({ error: 'Error creando huésped: ' + createError.message }, { status: 500 })
            }
            huesped_id = newGuest.id
        }

        // Step 2: Verify room is available
        const { data: room, error: roomError } = await supabase
            .from('habitaciones')
            .select('id, estado, numero')
            .eq('id', habitacion_id)
            .single()

        if (roomError || !room) {
            return NextResponse.json({ error: 'Habitación no encontrada' }, { status: 404 })
        }

        if (room.estado === 'ocupada') {
            return NextResponse.json({ error: `La habitación ${room.numero} ya está ocupada` }, { status: 409 })
        }

        if (room.estado === 'mantenimiento') {
            return NextResponse.json({ error: `La habitación ${room.numero} está en mantenimiento` }, { status: 409 })
        }

        // Step 3: If from reservation, update reservation status
        if (reserva_id) {
            const { error: reservaError } = await supabase
                .from('reservas')
                .update({ estado: 'checkin' })
                .eq('id', reserva_id)

            if (reservaError) {
                console.error('Error updating reservation:', reservaError)
            }
        }

        // Step 4: Calculate totals
        const nochesCalc = noches || 1
        const subtotal = precio_noche * nochesCalc

        // Get tax config for IGV
        const { data: configTrib } = await supabase
            .from('config_tributaria')
            .select('igv_porcentaje, es_zona_exonerada')
            .single()

        const igvPorcentaje = configTrib?.es_zona_exonerada ? 0 : (configTrib?.igv_porcentaje || 0)
        const igvMonto = subtotal * (igvPorcentaje / 100)
        const total = subtotal + igvMonto

        // Step 5: Create estadia record
        const { data: estadia, error: estadiaError } = await supabase
            .from('estadias')
            .insert({
                huesped_id,
                habitacion_id,
                reserva_id: reserva_id || null,
                fecha_checkin: new Date().toISOString(),
                fecha_checkout_prevista,
                estado: 'activa',
                estado_huesped: 'dentro',
                precio_noche,
                noches: nochesCalc,
                subtotal,
                afectacion_igv: configTrib?.es_zona_exonerada ? '20' : '10',
                igv_porcentaje: igvPorcentaje,
                igv_monto: igvMonto,
                total,
                adultos: adultos || 1,
                ninos: ninos || 0,
                notas: notas || null,
                registrado_por: user.id
            })
            .select(`
        *,
        huesped:huespedes(id, nombre, apellidos, numero_documento),
        habitacion:habitaciones(id, numero, tipo)
      `)
            .single()

        if (estadiaError) {
            return NextResponse.json({ error: 'Error creando estadía: ' + estadiaError.message }, { status: 500 })
        }

        // Step 6: Update room status to 'ocupada'
        const { error: updateRoomError } = await supabase
            .from('habitaciones')
            .update({ estado: 'ocupada' })
            .eq('id', habitacion_id)

        if (updateRoomError) {
            console.error('Error updating room status:', updateRoomError)
        }

        return NextResponse.json({
            estadia,
            message: `Check-in completado para habitación ${room.numero}`
        }, { status: 201 })

    } catch (error) {
        console.error('Check-in error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
