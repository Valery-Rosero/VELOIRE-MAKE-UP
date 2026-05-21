import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

const VALID_STATUSES: OrderStatus[] = [
  'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const status = body?.status as OrderStatus | undefined

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const updateData: Record<string, unknown> = { status }
  if (status === 'paid') {
    updateData.payment_confirmed_at = new Date().toISOString()
  }

  const { error } = await supabase.from('orders').update(updateData).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
