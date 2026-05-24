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

export async function cancelOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('status', 'pending_payment')
  if (error) return { error: error.message }
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
  return { success: true }
}
