import { createClient } from '@/lib/supabase/server'
import { CheckoutClient } from '@/components/store/CheckoutClient'
import type { CheckoutFormData } from '@/lib/validations/checkout'

async function getPageData(): Promise<{
  deliveryFee: number
  prefilledData: Partial<CheckoutFormData> | null
  hasSession: boolean
}> {
  try {
    const supabase = await createClient()

    const [configResult, userResult] = await Promise.all([
      supabase
        .from('store_config')
        .select('value')
        .eq('key', 'delivery_fee')
        .limit(1),
      supabase.auth.getUser(),
    ])

    const deliveryFee = parseInt(
      (configResult.data as Array<{ value: string }> | null)?.[0]?.value ?? '5000',
      10
    )

    const user = userResult.data.user
    if (!user) return { deliveryFee, prefilledData: null, hasSession: false }

    const { data: profileRows } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .limit(1)

    const profile = (
      profileRows as Array<{ full_name: string | null; email: string; phone: string | null }> | null
    )?.[0]

    if (!profile) return { deliveryFee, prefilledData: null, hasSession: true }

    return {
      deliveryFee,
      hasSession: true,
      prefilledData: {
        customer_name: profile.full_name ?? '',
        customer_email: profile.email,
        customer_phone: profile.phone ?? '',
      },
    }
  } catch {
    return { deliveryFee: 5000, prefilledData: null, hasSession: false }
  }
}

export default async function CheckoutPage() {
  const { deliveryFee, prefilledData, hasSession } = await getPageData()

  return (
    <CheckoutClient
      deliveryFee={deliveryFee}
      prefilledData={prefilledData}
      hasSession={hasSession}
    />
  )
}
