'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

export async function updateConfig(key: string, value: string) {
  const supabase = await createAdminClient()
  await supabase
    .from('store_config')
    .update({ value })
    .eq('key', key)
  revalidatePath('/admin/configuracion')
}
