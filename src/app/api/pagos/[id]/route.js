import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Get single payment
export async function GET(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: pago, error } = await supabase
            .from('pagos')
            .select(`
        *,
        estadia:estadias(
          id, total, fecha_checkin, fecha_checkout_prevista,
          huesped:huespedes(id, nombre, apellidos, numero_documento),
          habitacion:habitaciones(id, numero, tipo)
        )
      `)
            .eq('id', id)
            .single()

        if (error || !pago) {
            return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ pago })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update payment (e.g., change status to anulado)
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { estado, concepto, referencia } = body

        const updateData = {}
        if (estado !== undefined) updateData.estado = estado
        if (concepto !== undefined) updateData.concepto = concepto
        if (referencia !== undefined) updateData.referencia = referencia

        const { data: pago, error } = await supabase
            .from('pagos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ pago, message: 'Pago actualizado' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE - Void payment (soft delete by changing status)
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Check if payment can be voided
        const { data: pago } = await supabase
            .from('pagos')
            .select('estado')
            .eq('id', id)
            .single()

        if (pago?.estado === 'anulado') {
            return NextResponse.json({ error: 'El pago ya está anulado' }, { status: 400 })
        }

        // Soft delete - mark as voided
        const { error } = await supabase
            .from('pagos')
            .update({ estado: 'anulado' })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Pago anulado' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
