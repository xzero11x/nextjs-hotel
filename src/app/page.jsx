import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get room stats
    const { data: habitaciones } = await supabase
        .from('habitaciones')
        .select('id, estado')
        .eq('activa', true)

    const roomStats = {
        total: habitaciones?.length || 0,
        disponibles: habitaciones?.filter(h => h.estado === 'disponible').length || 0,
        ocupadas: habitaciones?.filter(h => h.estado === 'ocupada').length || 0,
        limpieza: habitaciones?.filter(h => h.estado === 'limpieza').length || 0,
        mantenimiento: habitaciones?.filter(h => h.estado === 'mantenimiento').length || 0
    }

    // Get today's revenue
    const { data: pagosHoy } = await supabase
        .from('pagos')
        .select('monto')
        .eq('estado', 'pagado')
        .gte('fecha_pago', today)

    const ingresoHoy = pagosHoy?.reduce((sum, p) => sum + p.monto, 0) || 0

    // Get week's revenue
    const { data: pagosSemana } = await supabase
        .from('pagos')
        .select('monto, fecha_pago')
        .eq('estado', 'pagado')
        .gte('fecha_pago', weekAgo)

    const ingresoSemana = pagosSemana?.reduce((sum, p) => sum + p.monto, 0) || 0

    // Get active stays
    const { count: checkinsActivos } = await supabase
        .from('estadias')
        .select('id', { count: 'exact' })
        .eq('estado', 'activa')

    // Pending check-ins today
    const { data: checkinsPendientes } = await supabase
        .from('reservas')
        .select('id, nombre_cliente, habitacion:habitaciones(numero)')
        .eq('fecha_inicio', today)
        .in('estado', ['pendiente', 'confirmada'])

    // Pending check-outs today
    const { data: checkoutsPendientes } = await supabase
        .from('estadias')
        .select('id, huesped:huespedes(nombre), habitacion:habitaciones(numero)')
        .eq('estado', 'activa')
        .eq('fecha_checkout_prevista', today)

    // Pending cleaning
    const { data: limpiezasPendientes } = await supabase
        .from('ordenes_servicio')
        .select('id, habitacion:habitaciones(numero)')
        .in('tipo_servicio', ['limpieza', 'limpieza_checkout', 'limpieza_programada'])
        .eq('estado', 'pendiente')

    // Weekly chart data
    const revenueByDay = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const dayName = date.toLocaleDateString('es-PE', { weekday: 'short' })

        const dayRevenue = pagosSemana
            ?.filter(p => p.fecha_pago.startsWith(dateStr))
            .reduce((sum, p) => sum + p.monto, 0) || 0

        revenueByDay.push({ dia: dayName, ingreso: dayRevenue })
    }

    const dashboardData = {
        habitaciones: roomStats,
        ocupacion: roomStats.total > 0 ? Math.round((roomStats.ocupadas / roomStats.total) * 100) : 0,
        ingresos: {
            hoy: ingresoHoy,
            semana: ingresoSemana
        },
        estadisticas: {
            huespedes_activos: checkinsActivos || 0,
            checkins_hoy: checkinsPendientes?.length || 0,
            checkouts_hoy: checkoutsPendientes?.length || 0,
            limpiezas_pendientes: limpiezasPendientes?.length || 0
        },
        acciones: {
            checkins: checkinsPendientes || [],
            checkouts: checkoutsPendientes || [],
            limpiezas: limpiezasPendientes || []
        },
        grafico: revenueByDay
    }

    return <DashboardClient initialData={dashboardData} />
}
