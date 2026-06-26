import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice, formatRelativeDate } from '@/lib/format'
import { OrdersSearch } from '@/components/admin/OrdersSearch'
import type { OrderStatus } from '@/types/database'
import type { OrderRow } from '@/types/orders'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  paid: 'Pago confirmado',
  preparing: 'En preparación',
  shipped: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-warning/15 text-warning',
  paid: 'bg-success/15 text-success',
  preparing: 'bg-accent/15 text-accent',
  shipped: 'bg-accent/15 text-accent',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-error/15 text-error',
}

const ALL_STATUSES: OrderStatus[] = [
  'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled',
]

const STATUS_TAB_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pendiente de pago',
  paid: 'Pagados',
  preparing: 'En preparación',
  shipped: 'Enviados',
  delivered: 'Entregados',
  cancelled: 'Cancelados',
}

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}

export default async function PedidosAdminPage({ searchParams }: PageProps) {
  const { status, q, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createAdminClient()

  // Count per status for tab badges
  const { data: countRows } = await supabase
    .from('orders')
    .select('status')

  const statusCounts = (countRows as Array<{ status: OrderStatus }> | null)?.reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1
      return acc
    },
    {} as Partial<Record<OrderStatus, number>>
  ) ?? {}

  const pendingCount = statusCounts.pending_payment ?? 0

  // Orders query
  let query = supabase
    .from('v_orders_detail')
    .select('id, order_number, customer_name, customer_email, status, total, item_count, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status && ALL_STATUSES.includes(status as OrderStatus)) {
    query = query.eq('status', status as OrderStatus)
  }

  if (q) {
    query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%`)
  }

  const { data, count } = await query
  const orders = (data as OrderRow[] | null) ?? []
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-fg">Pedidos</h1>
          {pendingCount > 0 && (
            <span className="font-body text-xs font-medium bg-rose-vivid text-white px-2 py-0.5 rounded-full">
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Link
          href="/admin/pedidos/nuevo"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Nuevo pedido
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/pedidos"
          className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
            !status ? 'bg-noir text-beige' : 'bg-card border border-rim text-fg-2 hover:border-rim-2'
          }`}
        >
          Todos {count && !status ? `(${count})` : ''}
        </Link>
        {ALL_STATUSES.map((s) => {
          const isActive = status === s
          const cnt = statusCounts[s] ?? 0
          const isPending = s === 'pending_payment'
          return (
            <Link
              key={s}
              href={`/admin/pedidos?status=${s}`}
              className={`relative px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                isActive
                  ? 'bg-noir text-beige'
                  : 'bg-card border border-rim text-fg-2 hover:border-rim-2'
              }`}
            >
              {isPending && cnt > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-vivid animate-pulse" />
              )}
              {STATUS_TAB_LABELS[s]}
              {cnt > 0 && <span className="ml-1 opacity-70">({cnt})</span>}
            </Link>
          )
        })}
      </div>

      {/* Search */}
      <div className="mb-5">
        <OrdersSearch defaultValue={q ?? ''} />
      </div>

      {/* Table */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        {orders.length === 0 ? (
          <p className="text-center font-body text-sm text-fg-3 py-12">No hay pedidos.</p>
        ) : (
          <div className="divide-y divide-rim">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  order.status === 'pending_payment' ? 'bg-highlight/30' : ''
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="shrink-0">
                    <p className="font-mono text-sm font-medium text-accent">#{order.order_number}</p>
                    <p className="font-body text-xs text-fg-3 mt-0.5">
                      {order.item_count} producto{order.item_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm text-fg truncate">{order.customer_name}</p>
                    <p className="font-body text-xs text-fg-3 truncate">{order.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="font-body text-sm font-medium text-gold hidden sm:block">
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full hidden md:inline-flex ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-body text-xs text-fg-3 hidden lg:block whitespace-nowrap">
                    {formatRelativeDate(order.created_at)}
                  </span>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-xs font-body text-accent hover:underline underline-offset-4 whitespace-nowrap"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/pedidos?${status ? `status=${status}&` : ''}${q ? `q=${q}&` : ''}page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-body transition-colors ${
                p === currentPage
                  ? 'bg-noir text-beige'
                  : 'bg-card border border-rim text-fg-2 hover:border-rim-2'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
