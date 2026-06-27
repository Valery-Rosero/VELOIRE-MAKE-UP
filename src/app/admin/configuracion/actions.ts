'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function updateConfig(key: string, value: string) {
  await requireAdmin()
  const supabase = await createAdminClient()
  await supabase
    .from('store_config')
    .upsert({ key, value }, { onConflict: 'key' })
  revalidatePath('/admin/configuracion')
}
