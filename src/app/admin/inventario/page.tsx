import { createAdminClient } from '@/lib/supabase/server'
import { InventoryTable, type InventoryRowData } from '@/components/admin/InventoryTable'

interface InventoryRow {
  product_id: string
  product_name: string
  category_name: string | null
  status: 'draft' | 'active' | 'inactive'
  total_shades: number
  total_stock: number
  out_of_stock_shades: number
  low_stock_shades: number
  min_shade_stock: number
}

interface ShadeRow {
  id: string
  product_id: string
  name: string
  hex_color: string
  stock: number
  is_active: boolean
}

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
  const shades = (shadeData as ShadeRow[] | null) ?? []

  const shadesByProduct = shades.reduce<Record<string, ShadeRow[]>>((acc, shade) => {
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
