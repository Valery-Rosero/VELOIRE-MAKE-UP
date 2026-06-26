export interface ShadeDetail {
  id: string
  product_id: string
  name: string
  hex_color: string
  stock: number
  is_active: boolean
}

export interface InventoryRow {
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

export interface InventoryRowData extends InventoryRow {
  shades: ShadeDetail[]
}
