import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET - Guest report
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

        // Get stays in period with guest info
        const { data: estadias } = await supabase
            .from('estadias')
            .select(`
        id, total, noches,
        huesped:huespedes(id, nacionalidad, procedencia, es_frecuente)
      `)
            .gte('fecha_checkin', desde)

        // Group by nationality
        const porNacionalidad = {}
        const porProcedencia = {}
        let totalHuespedes = 0
        let huespedesTotalesGasto = 0
        let huespedesFrecuentes = 0

        estadias?.forEach(e => {
            totalHuespedes++
            huespedesTotalesGasto += e.total || 0

            const nac = e.huesped?.nacionalidad || 'No especificado'
            porNacionalidad[nac] = (porNacionalidad[nac] || 0) + 1

            const proc = e.huesped?.procedencia || 'No especificado'
            porProcedencia[proc] = (porProcedencia[proc] || 0) + 1

            if (e.huesped?.es_frecuente) huespedesFrecuentes++
        })

        // Convert to arrays for charts
        const nacionalidadArray = Object.entries(porNacionalidad)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)

        const procedenciaArray = Object.entries(porProcedencia)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)

        // Top guests by spending
        const { data: topGuests } = await supabase
            .from('estadias')
            .select(`
        huesped:huespedes(id, nombre, apellidos),
        total
      `)
            .gte('fecha_checkin', desde)
            .order('total', { ascending: false })
            .limit(10)

        // Aggregate spending per guest
        const guestSpending = {}
        topGuests?.forEach(e => {
            const guestId = e.huesped?.id
            if (guestId) {
                if (!guestSpending[guestId]) {
                    guestSpending[guestId] = {
                        nombre: `${e.huesped.nombre} ${e.huesped.apellidos || ''}`.trim(),
                        total: 0
                    }
                }
                guestSpending[guestId].total += e.total || 0
            }
        })

        const topHuespedes = Object.values(guestSpending)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)

        return NextResponse.json({
            periodo_dias: dias,
            total_huespedes: totalHuespedes,
            gasto_promedio: totalHuespedes > 0 ? Math.round(huespedesTotalesGasto / totalHuespedes) : 0,
            huespedes_frecuentes: huespedesFrecuentes,
            por_nacionalidad: nacionalidadArray,
            por_procedencia: procedenciaArray,
            top_huespedes: topHuespedes
        })
    } catch (error) {
        console.error('Guest report error:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
