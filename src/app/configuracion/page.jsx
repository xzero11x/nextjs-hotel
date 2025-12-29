import { createClient } from '@/lib/supabase/server'
import ConfiguracionClient from './ConfiguracionClient'

export const metadata = {
  title: 'Configuración | Hotel Management',
  description: 'Configuración del hotel y datos tributarios',
}

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  // Get hotel config
  const { data: hotelConfig } = await supabase
    .from('hotel_config')
    .select('*')
    .limit(1)
    .single()

  // Get tax config
  const { data: taxConfig } = await supabase
    .from('config_tributaria')
    .select('*')
    .limit(1)
    .single()

  // Get current user role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user?.id)
    .single()

  return (
    <ConfiguracionClient
      initialHotel={hotelConfig || {}}
      initialTributaria={taxConfig || {}}
      isAdmin={['administrador', 'gerente'].includes(currentUser?.rol)}
    />
  )
}
