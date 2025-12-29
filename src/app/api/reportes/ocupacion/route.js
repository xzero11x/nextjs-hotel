import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Occupancy report
export async function GET(request) {
    try {
        const supabase = await createServerClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const dias = parseInt(searchParams.get('dias')) || 30

        // Get total rooms
        const { data: habitaciones } = await supabase
            .from('habitaciones')
            .select('id')
            .eq('activa', true)

        const totalRooms = habitaciones?.length || 1

        // Get occupancy data for each day
        const ocupacionDiaria = []

        for (let i = dias - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            const dateStr = date.toISOString().split('T')[0]

            // Count active stays for that date
            const { count: ocupadas } = await supabase
                .from('estadias')
                .select('id', { count: 'exact' })
                .lte('fecha_checkin', dateStr)
                .or(`fecha_checkout_real.is.null,fecha_checkout_real.gte.${dateStr}`)
                .eq('estado', 'activa')

            const porcentaje = Math.round(((ocupadas || 0) / totalRooms) * 100)

            ocupacionDiaria.push({
                fecha: dateStr,
                dia: date.toLocaleDateString('es-PE', { weekday: 'short' }),
                ocupadas: ocupadas || 0,
                disponibles: totalRooms - (ocupadas || 0),
                porcentaje
            })
        }

        // Calculate averages
        const promedioOcupacion = Math.round(
            ocupacionDiaria.reduce((sum, d) => sum + d.porcentaje, 0) / dias
        )

        // Weekly summary
        const semanas = []
        for (let i = 0; i < Math.ceil(dias / 7); i++) {
            const weekData = ocupacionDiaria.slice(i * 7, (i + 1) * 7)
            const weekAvg = Math.round(
                weekData.reduce((sum, d) => sum + d.porcentaje, 0) / weekData.length
            )
            semanas.push({
                semana: i + 1,
                promedio: weekAvg
            })
        }

        return NextResponse.json({
            total_habitaciones: totalRooms,
            dias_analizados: dias,
            promedio_ocupacion: promedioOcupacion,
            ocupacion_diaria: ocupacionDiaria.slice(-14), // Last 14 days for chart
            resumen_semanal: semanas
        })
    } catch (error) {
        console.error('Occupancy report error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
