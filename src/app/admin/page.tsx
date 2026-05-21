import Link from 'next/link'
import { ShoppingBag, Clock, TrendingUp, Package } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/format'
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
    <div>
      <h1 className="font-display text-2xl text-fg mb-6">Dashboard</h1>

      {/* Stock low alert */}
      {lowStockRows.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl px-5 py-4 mb-6">
          <p className="font-body text-sm font-medium text-warning mb-2">
            ⚠ Stock bajo en {lowStockRows.length} producto{lowStockRows.length > 1 ? 's' : ''}
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
            className="text-xs font-body text-warning hover:underline underline-offset-4"
          >
            Ver inventario completo →
          </Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-rim rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-xs text-fg-3">Pedidos hoy</p>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <ShoppingBag size={14} className="text-accent" />
            </div>
          </div>
          <p className="font-body text-[28px] font-medium text-fg leading-none">
            {ordersToday ?? 0}
          </p>
        </div>

        <div
          className={`bg-card border rounded-xl p-5 ${hasPending ? 'border-rose' : 'border-rim'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-xs text-fg-3">Pendientes de pago</p>
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock size={14} className="text-warning" />
            </div>
          </div>
          <p
            className={`font-body text-[28px] font-medium leading-none ${
              hasPending ? 'text-rose' : 'text-fg'
            }`}
          >
            {pendingPayment ?? 0}
          </p>
        </div>

        <div className="bg-card border border-rim rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-xs text-fg-3">Ingresos del mes</p>
            <div className="w-7 h-7 rounded-lg bg-gold-light flex items-center justify-center">
              <TrendingUp size={14} className="text-gold" />
            </div>
          </div>
          <p className="font-body text-[28px] font-medium text-gold leading-none">
            {formatPrice(salesMonth)}
          </p>
        </div>

        <div className="bg-card border border-rim rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-xs text-fg-3">Productos activos</p>
            <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
              <Package size={14} className="text-success" />
            </div>
          </div>
          <p className="font-body text-[28px] font-medium text-fg leading-none">
            {activeProducts ?? 0}
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rim">
          <h2 className="font-body text-sm font-medium text-fg">Pedidos recientes</h2>
          <Link
            href="/admin/pedidos"
            className="text-xs font-body text-accent hover:underline underline-offset-4"
          >
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-center font-body text-sm text-fg-3 py-10">No hay pedidos aún.</p>
        ) : (
          <div className="divide-y divide-rim">
            {recent.map((order) => (
              <div
                key={order.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  order.status === 'pending_payment' ? 'bg-rose-light/40' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-body text-sm font-medium text-fg shrink-0">
                    #{order.order_number}
                  </span>
                  <span className="font-body text-sm text-fg-2 truncate">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span
                    className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-body text-sm font-medium text-gold">
                    {formatPrice(order.total)}
                  </span>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-xs font-body text-accent hover:underline underline-offset-4"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-rim text-center">
          <Link
            href="/admin/pedidos"
            className="text-xs font-body text-fg-2 hover:text-fg transition-colors"
          >
            Ver todos los pedidos →
          </Link>
        </div>
      </div>
    </div>
  )
}
