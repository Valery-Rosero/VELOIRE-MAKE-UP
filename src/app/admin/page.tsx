import Link from 'next/link'
import { ShoppingBag, Clock, TrendingUp, Package, ArrowRight, AlertTriangle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import type { OrderStatus } from '@/types/database'

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

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  status: OrderStatus
  total: number
  created_at: string
}

interface LowStockRow {
  product_id: string
  product_name: string
  min_shade_stock: number
  total_stock: number
}

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    { count: ordersToday },
    { count: pendingPayment },
    { data: monthOrders },
    { count: activeProducts },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_payment'),
    supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'preparing', 'shipped', 'delivered'])
      .gte('created_at', monthStart.toISOString()),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('v_orders_detail')
      .select('id, order_number, customer_name, status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('v_inventory_summary')
      .select('product_id, product_name, min_shade_stock, total_stock')
      .lte('min_shade_stock', 5)
      .eq('status', 'active')
      .order('min_shade_stock'),
  ])

  const salesMonth =
    (monthOrders as Array<{ total: number }> | null)?.reduce((acc, o) => acc + o.total, 0) ?? 0
  const recent = (recentOrders as RecentOrder[] | null) ?? []
  const lowStockRows = (lowStock as LowStockRow[] | null) ?? []
  const hasPending = (pendingPayment ?? 0) > 0

  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-px h-4 bg-accent" />
          <p className="font-body text-xs text-accent uppercase tracking-widest">Bienvenida</p>
        </div>
        <h1 className="font-display text-3xl text-fg">Dashboard</h1>
      </div>

      {/* Low stock alert */}
      {lowStockRows.length > 0 && (
        <div className="bg-warning/8 border border-warning/25 rounded-2xl px-5 py-4 mb-6 flex gap-4">
          <div className="w-8 h-8 rounded-xl bg-warning/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={15} className="text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-medium text-warning mb-1.5">
              Stock bajo en {lowStockRows.length} producto{lowStockRows.length > 1 ? 's' : ''}
            </p>
            <ul className="space-y-0.5 mb-3">
              {lowStockRows.map((row) => (
                <li key={row.product_id} className="font-body text-sm text-fg-2">
                  {row.product_name}{' '}
                  <span className="text-warning font-medium">
                    ({row.total_stock === 0 ? 'Agotado' : `${row.min_shade_stock} und. mínimo`})
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/inventario"
              className="inline-flex items-center gap-1 text-xs font-body text-warning hover:opacity-80 transition-opacity"
            >
              Ver inventario completo
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="bg-card border border-rim rounded-2xl p-5 hover:border-rim-2 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <ShoppingBag size={16} className="text-accent" strokeWidth={1.5} />
          </div>
          <p className="font-display text-3xl text-fg leading-none mb-1.5">{ordersToday ?? 0}</p>
          <p className="font-body text-xs text-fg-3">Pedidos hoy</p>
        </div>

        <div className={`bg-card border rounded-2xl p-5 transition-colors ${hasPending ? 'border-accent/40 bg-highlight/30' : 'border-rim hover:border-rim-2'}`}>
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
            <Clock size={16} className="text-warning" strokeWidth={1.5} />
          </div>
          <p className={`font-display text-3xl leading-none mb-1.5 ${hasPending ? 'text-accent' : 'text-fg'}`}>
            {pendingPayment ?? 0}
          </p>
          <p className="font-body text-xs text-fg-3">Pendientes de pago</p>
        </div>

        <div className="bg-card border border-rim rounded-2xl p-5 hover:border-rim-2 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gold-light flex items-center justify-center mb-4">
            <TrendingUp size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <p className="font-display text-3xl text-gold leading-none mb-1.5">{formatPrice(salesMonth)}</p>
          <p className="font-body text-xs text-fg-3">Ingresos del mes</p>
        </div>

        <div className="bg-card border border-rim rounded-2xl p-5 hover:border-rim-2 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-4">
            <Package size={16} className="text-success" strokeWidth={1.5} />
          </div>
          <p className="font-display text-3xl text-fg leading-none mb-1.5">{activeProducts ?? 0}</p>
          <p className="font-body text-xs text-fg-3">Productos activos</p>
        </div>

      </div>

      {/* Recent orders */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-rim">
          <div className="flex items-center gap-2.5">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Pedidos recientes</h2>
          </div>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1 text-xs font-body text-accent hover:opacity-80 transition-opacity"
          >
            Ver todos
            <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-14 text-center">
            <ShoppingBag size={32} className="text-fg-3 mx-auto mb-3" strokeWidth={1} />
            <p className="font-body text-sm text-fg-3">No hay pedidos aún</p>
          </div>
        ) : (
          <div className="divide-y divide-rim">
            {recent.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className={`flex items-center justify-between px-6 py-3.5 hover:bg-highlight/40 transition-colors ${
                  order.status === 'pending_payment' ? 'bg-highlight/20' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-body text-sm font-medium text-fg shrink-0 tabular-nums">
                    #{order.order_number}
                  </span>
                  <span className="font-body text-sm text-fg-2 truncate">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span
                    className={`text-[11px] font-body font-medium px-2.5 py-1 rounded-full hidden sm:inline-flex ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-body text-sm font-semibold text-gold tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="px-6 py-3.5 border-t border-rim">
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-body text-fg-3 hover:text-fg transition-colors"
          >
            Ver todos los pedidos
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  )
}
