import ReportesClient from './ReportesClient'

export const metadata = {
  title: 'Reportes | Hotel Management',
  description: 'Reportes y estadísticas del hotel',
}

export default async function ReportesPage() {
  return <ReportesClient />
}
