import { createAdminClient } from '@/lib/supabase/server'
import { InventoryTable } from '@/components/admin/InventoryTable'
import type { InventoryRow, ShadeDetail, InventoryRowData } from '@/types/inventory'

export default async function InventarioPage() {
  const supabase = await createAdminClient()

  const [{ data: summaryData }, { data: shadeData }] = await Promise.all([
    supabase.from('v_inventory_summary').select('*').order('product_name'),
    supabase
      .from('product_shades')
      .select('id, product_id, name, hex_color, stock, is_active')
      .order('sort_order'),
  ])

  const summary = (summaryData as InventoryRow[] | null) ?? []
  const shades = (shadeData as ShadeDetail[] | null) ?? []

  const shadesByProduct = shades.reduce<Record<string, ShadeDetail[]>>((acc, shade) => {
    if (!acc[shade.product_id]) acc[shade.product_id] = []
    acc[shade.product_id].push(shade)
    return acc
  }, {})

  const rows: InventoryRowData[] = summary.map((row) => ({
    ...row,
    shades: shadesByProduct[row.product_id] ?? [],
  }))

  return (
    <div>
      <h1 className="font-display text-2xl text-fg mb-6">Inventario</h1>
      <InventoryTable rows={rows} />
    </div>
  )
}
