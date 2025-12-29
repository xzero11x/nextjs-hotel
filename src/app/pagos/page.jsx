import { createClient } from '@/lib/supabase/server'
import PagosClient from './PagosClient'

export const metadata = {
  title: 'Pagos | Hotel Management',
  description: 'Gestión de pagos y cobros',
}

export default async function PagosPage() {
  const supabase = await createClient()

  // Fetch recent payments
  const { data: pagos } = await supabase
    .from('pagos')
    .select(`
      *,
      estadia:estadias(
        id, total,
        huesped:huespedes(id, nombre, apellidos, numero_documento),
        habitacion:habitaciones(id, numero, tipo)
      )
    `)
    .order('fecha_pago', { ascending: false })
    .limit(50)

  // Fetch active stays for new payment form
  const { data: estadiasActivas } = await supabase
    .from('estadias')
    .select(`
      id, total, fecha_checkin,
      huesped:huespedes(id, nombre, apellidos, numero_documento),
      habitacion:habitaciones(id, numero, tipo)
    `)
    .eq('estado', 'activa')
    .order('fecha_checkin', { ascending: false })

  // Calculate today's totals
  const today = new Date().toISOString().split('T')[0]
  const { data: pagosHoy } = await supabase
    .from('pagos')
    .select('monto, metodo_pago')
    .eq('estado', 'pagado')
    .gte('fecha_pago', today)

  const resumenHoy = {
    total: pagosHoy?.reduce((sum, p) => sum + p.monto, 0) || 0,
    cantidad: pagosHoy?.length || 0,
    efectivo: pagosHoy?.filter(p => p.metodo_pago === 'efectivo').reduce((sum, p) => sum + p.monto, 0) || 0,
    digital: pagosHoy?.filter(p => ['yape', 'plin', 'transferencia'].includes(p.metodo_pago)).reduce((sum, p) => sum + p.monto, 0) || 0
  }

  return (
    <PagosClient
      initialPagos={pagos || []}
      initialEstadias={estadiasActivas || []}
      resumenHoy={resumenHoy}
    />
  )
}
