import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { CartPortal } from '@/components/store/CartPortal'
import { createClient } from '@/lib/supabase/server'

async function getStoreConfig(): Promise<{
  instagram_url?: string
  whatsapp_number?: string
  delivery_fee?: string
}> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('key, value')
      .in('key', ['instagram_url', 'whatsapp_number', 'delivery_fee'])
    return Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]))
  } catch {
    return {}
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const config = await getStoreConfig()
  const deliveryFee = parseInt(config.delivery_fee ?? '5000', 10)

  return (
    <>
      <Header />
      <CartPortal deliveryFee={deliveryFee} />
      <main className="flex-1">{children}</main>
      <Footer instagramUrl={config.instagram_url} whatsappNumber={config.whatsapp_number} />
    </>
  )
}
