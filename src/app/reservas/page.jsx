import { createClient } from '@/lib/supabase/server'
import ReservasClient from './ReservasClient'

export const metadata = {
  title: 'Reservas | Hotel Management',
  description: 'Gestión de reservaciones',
}

export default async function ReservasPage() {
  const supabase = await createClient()

  // Fetch initial data on the server
  const { data: reservas, error: reservasError } = await supabase
    .from('reservas')
    .select(`
      *,
      habitacion:habitaciones(id, numero, tipo, piso, precio_base),
      huesped:huespedes(id, nombre, apellidos, tipo_documento, numero_documento, telefono, email)
    `)
    .order('fecha_inicio', { ascending: true })

  const { data: habitaciones, error: habitacionesError } = await supabase
    .from('habitaciones')
    .select('*')
    .eq('activa', true)
    .order('numero')

  // Handle errors gracefully
  if (reservasError) {
    console.error('Error fetching reservas:', reservasError)
  }
  if (habitacionesError) {
    console.error('Error fetching habitaciones:', habitacionesError)
  }

  return (
    <ReservasClient
      initialReservas={reservas || []}
      initialHabitaciones={habitaciones || []}
    />
  )
}
