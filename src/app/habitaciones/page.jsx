import { createClient } from '@/lib/supabase/server'
import HabitacionesClient from './HabitacionesClient'

export const metadata = {
  title: 'Habitaciones | Hotel Management',
  description: 'Gestión de habitaciones del hotel',
}

export default async function HabitacionesPage() {
  const supabase = await createClient()

  // Fetch rooms with their current status
  const { data: habitaciones, error: habError } = await supabase
    .from('habitaciones')
    .select('*')
    .eq('activa', true)
    .order('numero')

  // Fetch tarifas for room types
  const { data: tarifas, error: tarifasError } = await supabase
    .from('tarifas')
    .select('*')
    .eq('activo', true)

  // Fetch current stays to know which rooms are occupied and by whom
  const { data: estadias, error: estadiasError } = await supabase
    .from('estadias')
    .select(`
      *,
      huesped:huespedes(id, nombre, apellidos, tipo_documento, numero_documento, telefono)
    `)
    .eq('estado', 'activa')

  if (habError) console.error('Error fetching habitaciones:', habError)
  if (tarifasError) console.error('Error fetching tarifas:', tarifasError)
  if (estadiasError) console.error('Error fetching estadias:', estadiasError)

  return (
    <HabitacionesClient
      initialHabitaciones={habitaciones || []}
      initialTarifas={tarifas || []}
      initialEstadias={estadias || []}
    />
  )
}
