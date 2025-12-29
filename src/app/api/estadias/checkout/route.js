import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * CHECK-OUT Process
 * 
 * 1. Close estadia (fecha_checkout_real)
 * 2. Change habitacion estado to 'limpieza'
 * 3. Create automatic ordenes_servicio for cleaning
 * 4. Calculate pending totals
 */
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { estadia_id, notas_checkout, cobros_adicionales } = body

        if (!estadia_id) {
            return NextResponse.json({ error: 'estadia_id es requerido' }, { status: 400 })
        }

        // Step 1: Get current stay with all details
        const { data: estadia, error: estadiaError } = await supabase
            .from('estadias')
            .select(`
        *,
        huesped:huespedes(id, nombre, apellidos, numero_documento),
        habitacion:habitaciones(id, numero, tipo, piso)
      `)
            .eq('id', estadia_id)
            .single()

        if (estadiaError || !estadia) {
            return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 })
        }

        if (estadia.estado === 'checkout') {
            return NextResponse.json({ error: 'Esta estadía ya tiene checkout realizado' }, { status: 409 })
        }

        // Step 2: Calculate real stay duration and adjust totals if needed
        const fechaCheckin = new Date(estadia.fecha_checkin)
        const fechaCheckout = new Date()
        const diasReales = Math.ceil((fechaCheckout - fechaCheckin) / (1000 * 60 * 60 * 24))

        // Recalculate if stayed different days
        let nuevoSubtotal = estadia.subtotal
        let nuevoIgv = estadia.igv_monto
        let nuevoTotal = estadia.total

        if (diasReales !== estadia.noches) {
            nuevoSubtotal = estadia.precio_noche * diasReales
            nuevoIgv = nuevoSubtotal * (estadia.igv_porcentaje / 100)
            nuevoTotal = nuevoSubtotal + nuevoIgv
        }

        // Add additional charges if any
        const adicionales = cobros_adicionales || 0
        const totalFinal = nuevoTotal + adicionales

        // Step 3: Update estadia to checkout
        const { data: updatedEstadia, error: updateError } = await supabase
            .from('estadias')
            .update({
                fecha_checkout_real: fechaCheckout.toISOString(),
                estado: 'checkout',
                estado_huesped: 'checkout',
                noches: diasReales,
                subtotal: nuevoSubtotal,
                igv_monto: nuevoIgv,
                total: totalFinal,
                notas: estadia.notas
                    ? `${estadia.notas}\n\nCheckout: ${notas_checkout || 'Sin notas adicionales'}`
                    : notas_checkout || null
            })
            .eq('id', estadia_id)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json({ error: 'Error cerrando estadía: ' + updateError.message }, { status: 500 })
        }

        // Step 4: Change room status to 'limpieza'
        const { error: roomError } = await supabase
            .from('habitaciones')
            .update({ estado: 'limpieza' })
            .eq('id', estadia.habitacion_id)

        if (roomError) {
            console.error('Error updating room status:', roomError)
        }

        // Step 5: Create automatic cleaning order (ordenes_servicio)
        const { data: ordenLimpieza, error: ordenError } = await supabase
            .from('ordenes_servicio')
            .insert({
                habitacion_id: estadia.habitacion_id,
                tipo_servicio: 'limpieza_checkout',
                estado: 'pendiente',
                prioridad: 'alta',
                notas: `Limpieza post-checkout. Huésped: ${estadia.huesped?.nombre} ${estadia.huesped?.apellidos || ''}. Habitación ${estadia.habitacion?.numero}.`,
                solicitado_por: user.id
            })
            .select()
            .single()

        if (ordenError) {
            console.error('Error creating cleaning order:', ordenError)
            // Don't fail the checkout if cleaning order fails
        }

        // Step 6: Get pending payments summary
        const { data: pagos } = await supabase
            .from('pagos')
            .select('monto, tipo')
            .eq('estadia_id', estadia_id)
            .eq('estado', 'completado')

        const totalPagado = pagos?.reduce((sum, p) => sum + p.monto, 0) || 0
        const saldoPendiente = totalFinal - totalPagado

        return NextResponse.json({
            estadia: updatedEstadia,
            resumen: {
                habitacion: estadia.habitacion?.numero,
                huesped: `${estadia.huesped?.nombre} ${estadia.huesped?.apellidos || ''}`,
                dias_reales: diasReales,
                subtotal: nuevoSubtotal,
                igv: nuevoIgv,
                adicionales,
                total: totalFinal,
                pagado: totalPagado,
                saldo_pendiente: saldoPendiente
            },
            orden_limpieza: ordenLimpieza?.id ? true : false,
            message: `Check-out completado. Habitación ${estadia.habitacion?.numero} pasada a limpieza.`
        })

    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
