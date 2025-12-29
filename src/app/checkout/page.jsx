import { createClient } from '@/lib/supabase/server'
import CheckoutClient from './CheckoutClient'

export const metadata = {
  title: 'Check-out | Hotel Management',
  description: 'Registro de salida de huéspedes',
}

export default async function CheckoutPage() {
  const supabase = await createClient()

  // Fetch active stays (guests currently checked in)
  const { data: estadiasActivas } = await supabase
    .from('estadias')
    .select(`
      *,
      huesped:huespedes(id, nombre, apellidos, tipo_documento, numero_documento, telefono, email),
      habitacion:habitaciones(id, numero, tipo, piso, precio_base)
    `)
    .eq('estado', 'activa')
    .order('fecha_checkin', { ascending: false })

  return (
    <CheckoutClient initialEstadias={estadiasActivas || []} />
  )
}
