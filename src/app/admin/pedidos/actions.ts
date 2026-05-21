'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createAdminClient()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
}
