import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { createClient } from '@/lib/supabase/server'

async function getStoreConfig(): Promise<{ instagram_url?: string; whatsapp_number?: string }> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('key, value')
      .in('key', ['instagram_url', 'whatsapp_number'])
    return Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]))
  } catch {
    return {}
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const config = await getStoreConfig()
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer instagramUrl={config.instagram_url} whatsappNumber={config.whatsapp_number} />
    </>
  )
}
