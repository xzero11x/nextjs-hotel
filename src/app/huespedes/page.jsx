import { createClient } from '@/lib/supabase/server'
import HuespedesClient from './HuespedesClient'

export const metadata = {
  title: 'Huéspedes | Hotel Management',
  description: 'Gestión de huéspedes y CRM',
}

export default async function HuespedesPage() {
  const supabase = await createClient()

  // Fetch guests with recent activity
  const { data: huespedes, error } = await supabase
    .from('huespedes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching huespedes:', error)
  }

  return (
    <HuespedesClient initialHuespedes={huespedes || []} />
  )
}
