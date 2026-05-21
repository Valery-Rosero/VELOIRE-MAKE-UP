import { createAdminClient } from '@/lib/supabase/server'
import { ConfigForm } from '@/components/admin/ConfigForm'

interface ConfigRow {
  key: string
  value: string
  description: string | null
}

export default async function ConfiguracionPage() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('store_config').select('key, value, description')

  const rows = (data as ConfigRow[] | null) ?? []
  const config = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-fg mb-6">Configuración</h1>
      <ConfigForm config={config} />
    </div>
  )
}
