import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { CreateOrderForm } from '@/components/admin/CreateOrderForm'

interface RawProduct {
  id: string
  name: string
  price: number
  product_images: Array<{ url: string; is_main: boolean }>
  product_shades: Array<{ id: string; name: string; hex_color: string; stock: number; is_active: boolean }>
}

export default async function NuevoPedidoPage() {
  const supabase = await createAdminClient()

  const [{ data: rawProducts }, { data: feeRows }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, product_images(url, is_main), product_shades(id, name, hex_color, stock, is_active)')
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('store_config')
      .select('value')
      .eq('key', 'delivery_fee')
      .limit(1),
  ])

  const deliveryFee = parseInt(
    (feeRows as Array<{ value: string }> | null)?.[0]?.value ?? '5000',
    10
  )

  const products = ((rawProducts as RawProduct[] | null) ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.product_images?.find((i) => i.is_main)?.url ?? p.product_images?.[0]?.url,
    shades: (p.product_shades ?? [])
      .filter((s) => s.is_active && s.stock > 0)
      .map((s) => ({ id: s.id, name: s.name, hex: s.hex_color, stock: s.stock })),
  }))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/pedidos"
          className="p-1.5 rounded-lg text-fg-2 hover:text-fg hover:bg-highlight transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl text-fg">Nuevo pedido</h1>
      </div>

      <CreateOrderForm products={products} deliveryFee={deliveryFee} />
    </div>
  )
}
