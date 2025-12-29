import { createClient } from '@/lib/supabase/server'
import PreciosClient from './PreciosClient'

export const metadata = {
  title: 'Precios y Tarifas | Hotel Management',
  description: 'Gestión de precios, tarifas y temporadas',
}

export default async function PreciosPage() {
  const supabase = await createClient()

  // Fetch tarifas
  const { data: tarifas } = await supabase
    .from('tarifas')
    .select('*')
    .order('tipo_habitacion')

  // Fetch temporadas
  const { data: temporadas } = await supabase
    .from('temporadas')
    .select('*')
    .order('fecha_inicio')

  // Get current season
  const { data: temporadaActual } = await supabase.rpc('obtener_temporada_actual')

  return (
    <PreciosClient
      initialTarifas={tarifas || []}
      initialTemporadas={temporadas || []}
      temporadaActual={temporadaActual || 'media'}
    />
  )
}
