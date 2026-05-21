import { createClient } from '@/lib/supabase/server'
import { PagoClient } from '@/components/store/PagoClient'

async function getPageData(): Promise<{
  nequiNumber: string
  nequiName: string
  deliveryFee: number
}> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('key, value')
      .in('key', ['nequi_number', 'nequi_name', 'delivery_fee'])
    const config = Object.fromEntries(
      ((data as Array<{ key: string; value: string }> | null) ?? []).map(({ key, value }) => [
        key,
        value,
      ])
    )
    return {
      nequiNumber: config.nequi_number ?? '',
      nequiName: config.nequi_name ?? '',
      deliveryFee: parseInt(config.delivery_fee ?? '5000', 10),
    }
  } catch {
    return { nequiNumber: '', nequiName: '', deliveryFee: 5000 }
  }
}

export default async function PagoPage() {
  const { nequiNumber, nequiName, deliveryFee } = await getPageData()
  return (
    <PagoClient
      nequiNumber={nequiNumber}
      nequiName={nequiName}
      deliveryFee={deliveryFee}
    />
  )
}
