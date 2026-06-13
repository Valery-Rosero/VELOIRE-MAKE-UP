'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function restoreOrderStock(orderId: string) {
  const supabase = await createAdminClient()

  const { data: items } = await supabase
    .from('order_items')
    .select('shade_id, quantity')
    .eq('order_id', orderId)

  if (!items?.length) return

  const shadeIds = items.map((i) => i.shade_id).filter(Boolean) as string[]
  if (!shadeIds.length) return

  const { data: shades } = await supabase
    .from('product_shades')
    .select('id, stock')
    .in('id', shadeIds)

  const stockMap = new Map((shades ?? []).map((s) => [s.id, s.stock]))

  await Promise.all(
    items.map(async (item) => {
      if (!item.shade_id) return
      const current = stockMap.get(item.shade_id) ?? 0
      await supabase
        .from('product_shades')
        .update({ stock: current + item.quantity })
        .eq('id', item.shade_id)
    })
  )
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (status === 'cancelled') {
    await restoreOrderStock(orderId)
  }

  const supabase = await createAdminClient()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
}

export async function cancelOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  await restoreOrderStock(orderId)

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .neq('status', 'delivered')
    .neq('status', 'cancelled')

  if (error) return { error: error.message }
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
  return { success: true }
}

export async function deleteOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Pedido no encontrado' }
  if (order.status !== 'cancelled') return { error: 'Solo se pueden eliminar pedidos cancelados' }

  // Eliminar registros hijos (por si no hay CASCADE en la DB)
  await Promise.all([
    supabase.from('order_items').delete().eq('order_id', orderId),
    supabase.from('order_status_history').delete().eq('order_id', orderId),
    supabase.from('email_notifications').delete().eq('order_id', orderId),
  ])

  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) return { error: error.message }

  revalidatePath('/admin/pedidos')
  return { success: true }
}
