import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - List payments with filters
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const estadia_id = searchParams.get('estadia_id')
        const estado = searchParams.get('estado')
        const fecha_desde = searchParams.get('fecha_desde')
        const fecha_hasta = searchParams.get('fecha_hasta')
        const limit = parseInt(searchParams.get('limit')) || 50

        let query = supabase
            .from('pagos')
            .select(`
        *,
        estadia:estadias(
          id,
          total,
          huesped:huespedes(id, nombre, apellidos, numero_documento),
          habitacion:habitaciones(id, numero, tipo)
        ),
        registrado_por_usuario:usuarios!pagos_registrado_por_fkey(nombre)
      `)
            .order('fecha_pago', { ascending: false })
            .limit(limit)

        if (estadia_id) query = query.eq('estadia_id', estadia_id)
        if (estado) query = query.eq('estado', estado)
        if (fecha_desde) query = query.gte('fecha_pago', fecha_desde)
        if (fecha_hasta) query = query.lte('fecha_pago', fecha_hasta)

        const { data: pagos, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Calculate totals
        const totalPagado = pagos
            ?.filter(p => p.estado === 'pagado')
            .reduce((sum, p) => sum + (p.monto || 0), 0) || 0

        return NextResponse.json({
            pagos,
            resumen: {
                total_registros: pagos?.length || 0,
                total_pagado: totalPagado
            }
        })
    } catch (error) {
        console.error('Error listing payments:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Create new payment
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const {
            estadia_id,
            monto,
            metodo_pago,
            concepto,
            referencia
        } = body

        // Validate required fields
        if (!estadia_id || !monto || !metodo_pago) {
            return NextResponse.json({
                error: 'estadia_id, monto y metodo_pago son requeridos'
            }, { status: 400 })
        }

        // Verify estadia exists
        const { data: estadia, error: estadiaError } = await supabase
            .from('estadias')
            .select('id, total, estado, huesped:huespedes(nombre)')
            .eq('id', estadia_id)
            .single()

        if (estadiaError || !estadia) {
            return NextResponse.json({ error: 'Estadía no encontrada' }, { status: 404 })
        }

        // Create payment
        const { data: pago, error } = await supabase
            .from('pagos')
            .insert({
                estadia_id,
                monto: parseFloat(monto),
                metodo_pago,
                concepto: concepto || 'Pago de estadía',
                referencia: referencia || null,
                estado: 'pagado',
                fecha_pago: new Date().toISOString(),
                registrado_por: user.id
            })
            .select(`
        *,
        estadia:estadias(id, total, huesped:huespedes(nombre))
      `)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Calculate new balance
        const { data: allPayments } = await supabase
            .from('pagos')
            .select('monto')
            .eq('estadia_id', estadia_id)
            .eq('estado', 'pagado')

        const totalPagado = allPayments?.reduce((sum, p) => sum + p.monto, 0) || 0
        const saldoPendiente = (estadia.total || 0) - totalPagado

        return NextResponse.json({
            pago,
            balance: {
                total_estadia: estadia.total,
                total_pagado: totalPagado,
                saldo_pendiente: Math.max(0, saldoPendiente)
            },
            message: `Pago de S/ ${monto} registrado exitosamente`
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating payment:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
