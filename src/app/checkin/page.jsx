import { createClient } from '@/lib/supabase/server'
import CheckinClient from './CheckinClient'

export const metadata = {
  title: 'Check-in | Hotel Management',
  description: 'Registro de entrada de huéspedes',
}

export default async function CheckinPage() {
  const supabase = await createClient()

  // Fetch available rooms for check-in
  const { data: habitaciones } = await supabase
    .from('habitaciones')
    .select('*')
    .eq('activa', true)
    .in('estado', ['disponible', 'limpieza'])
    .order('numero')

  // Fetch pending reservations for today or future
  const today = new Date().toISOString().split('T')[0]
  const { data: reservasPendientes } = await supabase
    .from('reservas')
    .select(`
      *,
      habitacion:habitaciones(id, numero, tipo, piso, precio_base)
    `)
    .in('estado', ['pendiente', 'confirmada'])
    .gte('fecha_inicio', today)
    .order('fecha_inicio')

  // Fetch tarifas
  const { data: tarifas } = await supabase
    .from('tarifas')
    .select('*')
    .eq('activo', true)

  return (
    <CheckinClient
      initialHabitaciones={habitaciones || []}
      initialReservas={reservasPendientes || []}
      initialTarifas={tarifas || []}
    />
  )
}
