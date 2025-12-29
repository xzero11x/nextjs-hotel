import { createClient } from '@/lib/supabase/server'
import LimpiezaClient from './LimpiezaClient'

export const metadata = {
  title: 'Limpieza | Hotel Management',
  description: 'Gestión de limpieza de habitaciones',
}

export default async function LimpiezaPage() {
  const supabase = await createClient()

  // Fetch cleaning orders
  const { data: ordenes } = await supabase
    .from('ordenes_servicio')
    .select(`
      *,
      habitacion:habitaciones(id, numero, tipo, piso, estado)
    `)
    .in('tipo_servicio', ['limpieza_checkout', 'limpieza_programada', 'limpieza'])
    .order('created_at', { ascending: false })

  // Fetch rooms that need cleaning
  const { data: habitacionesLimpieza } = await supabase
    .from('habitaciones')
    .select('*')
    .eq('estado', 'limpieza')
    .eq('activa', true)
    .order('numero')

  return (
    <LimpiezaClient
      initialOrdenes={ordenes || []}
      initialHabitacionesLimpieza={habitacionesLimpieza || []}
    />
  )
}
