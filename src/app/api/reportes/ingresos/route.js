import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Revenue report
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const dias = parseInt(searchParams.get('dias')) || 30
        const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()

        // Get all payments in period
        const { data: pagos } = await supabase
            .from('pagos')
            .select('monto, metodo_pago, fecha_pago, estado')
            .eq('estado', 'pagado')
            .gte('fecha_pago', desde)
            .order('fecha_pago')

        // Group by day
        const ingresosDiarios = {}
        const metodos = { efectivo: 0, yape: 0, plin: 0, tarjeta: 0, transferencia: 0, deposito: 0 }

        pagos?.forEach(pago => {
            const fecha = pago.fecha_pago.split('T')[0]
            if (!ingresosDiarios[fecha]) {
                ingresosDiarios[fecha] = 0
            }
            ingresosDiarios[fecha] += pago.monto

            if (metodos[pago.metodo_pago] !== undefined) {
                metodos[pago.metodo_pago] += pago.monto
            }
        })

        // Fill missing days
        const ingresosPorDia = []
        for (let i = dias - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            const dateStr = date.toISOString().split('T')[0]

            ingresosPorDia.push({
                fecha: dateStr,
                dia: date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
                ingreso: ingresosDiarios[dateStr] || 0
            })
        }

        const totalIngresos = pagos?.reduce((sum, p) => sum + p.monto, 0) || 0
        const promedioDialio = Math.round(totalIngresos / dias)

        // Top days
        const topDias = [...ingresosPorDia]
            .sort((a, b) => b.ingreso - a.ingreso)
            .slice(0, 5)

        return NextResponse.json({
            periodo_dias: dias,
            total_ingresos: totalIngresos,
            promedio_diario: promedioDialio,
            ingresos_diarios: ingresosPorDia.slice(-14), // Last 14 for chart
            por_metodo: metodos,
            top_dias: topDias
        })
    } catch (error) {
        console.error('Revenue report error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
