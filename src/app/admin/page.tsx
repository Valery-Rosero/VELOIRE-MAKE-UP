import Link from 'next/link'
import {
  ShoppingBag, Clock, TrendingUp, Package, ArrowRight,
  AlertTriangle, Users, BarChart2, Target, XCircle,
  Repeat2, ShoppingCart, CalendarDays, Wallet, Percent, Tag,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/format'
import type { OrderStatus } from '@/types/database'
import type { RawOrder, RawItem, LowStockRow } from '@/types/orders'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { DonutChart } from '@/components/admin/dashboard/DonutChart'
import { HorizontalBars } from '@/components/admin/dashboard/HorizontalBars'
import { StatCard } from '@/components/admin/dashboard/StatCard'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAID: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered']

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  paid: 'Pago confirmado',
  preparing: 'En preparación',
  shipped: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: '#E65100',
  paid: '#1D9E75',
  preparing: '#a56583',
  shipped: '#7b68a8',
  delivered: '#1D9E75',
  cancelled: '#C62828',
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending_payment: 'bg-warning/15 text-warning',
  paid: 'bg-success/15 text-success',
  preparing: 'bg-accent/15 text-accent',
  shipped: 'bg-accent/15 text-accent',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-error/15 text-error',
}

const CAT_PALETTE = ['#a56583','#B8860B','#1D9E75','#7b68a8','#185FA5','#c08fa2','#D4A017']

const WEEKDAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOf(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient()

  const now        = new Date()
  const todayStart = startOf(now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevEnd    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const ago60      = daysAgo(60)
  const ago30      = daysAgo(30)

  // ── Round 1: all independent queries ─────────────────────────────────────────

  const [
    { count: ordersToday },
    { count: pendingPayment },
    { count: activeProductCount },
    { data: recentRows },
    { data: lowStock },
    { data: orders60d },
    { data: productsWithCats },
    { data: activeProds },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('status', 'pending_payment'),
    supabase.from('products').select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('v_orders_detail')
      .select('id, order_number, customer_name, status, total, created_at')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('v_inventory_summary')
      .select('product_id, product_name, min_shade_stock, total_stock')
      .lte('min_shade_stock', 5).eq('status', 'active')
      .order('min_shade_stock'),
    supabase.from('orders')
      .select('id, status, total, created_at, customer_email')
      .gte('created_at', ago60.toISOString()),
    supabase.from('products')
      .select('id, categories(name)').eq('status', 'active'),
    supabase.from('products')
      .select('id, name').eq('status', 'active'),
  ])

  const allOrders = (orders60d as RawOrder[] | null) ?? []

  // ── Round 2: order items + product meta for paid orders last 30 days ────────

  const paidIds30d = allOrders
    .filter(o => PAID.includes(o.status) && new Date(o.created_at) >= ago30)
    .map(o => o.id)

  const items: RawItem[] = paidIds30d.length > 0
    ? (await supabase.from('order_items')
        .select('product_id, product_name, shade_id, shade_name, shade_hex, quantity, subtotal')
        .in('order_id', paidIds30d)).data ?? []
    : []

  // Metadata de productos vendidos — brand y cost_price para análisis financiero
  const soldProductIds = [...new Set(items.map(i => i.product_id).filter(Boolean))] as string[]
  const productMeta: Map<string, { brand: string | null; cost_price: number | null }> = new Map()
  if (soldProductIds.length > 0) {
    const { data: metaRows } = await supabase
      .from('products')
      .select('id, brand, cost_price')
      .in('id', soldProductIds)
    ;(metaRows ?? []).forEach(p => {
      productMeta.set(p.id, { brand: p.brand ?? null, cost_price: p.cost_price ?? null })
    })
  }

  // ── Compute metrics ───────────────────────────────────────────────────────────

  // Revenue this month and last month
  const salesMonth = allOrders
    .filter(o => PAID.includes(o.status) && new Date(o.created_at) >= monthStart)
    .reduce((s, o) => s + o.total, 0)

  const salesLastMonth = allOrders
    .filter(o => PAID.includes(o.status) && new Date(o.created_at) >= prevStart && new Date(o.created_at) <= prevEnd)
    .reduce((s, o) => s + o.total, 0)

  const monthTrend = salesLastMonth > 0
    ? ((salesMonth - salesLastMonth) / salesLastMonth) * 100
    : undefined

  // Average order value (paid orders this month)
  const paidThisMonth = allOrders.filter(o => PAID.includes(o.status) && new Date(o.created_at) >= monthStart)
  const avgOrderValue = paidThisMonth.length > 0
    ? paidThisMonth.reduce((s, o) => s + o.total, 0) / paidThisMonth.length
    : 0

  // Cancellation rate this month
  const totalThisMonth = allOrders.filter(o => new Date(o.created_at) >= monthStart)
  const cancelledThisMonth = totalThisMonth.filter(o => o.status === 'cancelled').length
  const cancellationRate = totalThisMonth.length > 0
    ? (cancelledThisMonth / totalThisMonth.length) * 100
    : 0

  // End-of-month projection
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysElapsed = now.getDate()
  const projection = daysElapsed > 0 ? (salesMonth / daysElapsed) * daysInMonth : 0

  // Daily revenue last 30 days
  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const d = startOf(daysAgo(29 - i))
    const next = new Date(d.getTime() + 86_400_000)
    const value = allOrders
      .filter(o => PAID.includes(o.status) && new Date(o.created_at) >= d && new Date(o.created_at) < next)
      .reduce((s, o) => s + o.total, 0)
    return {
      date: d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
      value,
    }
  })

  // Orders by status (last 30 days)
  const statusMap = new Map<OrderStatus, number>()
  allOrders
    .filter(o => new Date(o.created_at) >= ago30)
    .forEach(o => statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1))
  const statusDist = (Object.keys(STATUS_LABELS) as OrderStatus[])
    .filter(s => (statusMap.get(s) ?? 0) > 0)
    .map(s => ({ label: STATUS_LABELS[s], value: statusMap.get(s)!, color: STATUS_COLORS[s] }))
  const totalOrders30d = [...statusMap.values()].reduce((a, b) => a + b, 0)

  // Top 5 products by revenue (last 30 days)
  const productMap = new Map<string, { name: string; revenue: number }>()
  items.forEach(item => {
    const key = item.product_id ?? item.product_name
    const existing = productMap.get(key) ?? { name: item.product_name, revenue: 0 }
    productMap.set(key, { ...existing, revenue: existing.revenue + item.subtotal })
  })
  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(p => ({
      label: p.name,
      value: p.revenue,
      formattedValue: formatPrice(p.revenue),
    }))

  // Top 5 shades by quantity (last 30 days)
  const shadeMap = new Map<string, { productName: string; shadeName: string; hex: string; qty: number }>()
  items.forEach(item => {
    const key = item.shade_id ?? `${item.product_name}-${item.shade_name}`
    const existing = shadeMap.get(key) ?? { productName: item.product_name, shadeName: item.shade_name, hex: item.shade_hex, qty: 0 }
    shadeMap.set(key, { ...existing, qty: existing.qty + item.quantity })
  })
  const topShades = [...shadeMap.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map(s => ({
      label: s.shadeName || s.productName,
      sublabel: s.shadeName ? s.productName : undefined,
      value: s.qty,
      formattedValue: `${s.qty} und.`,
      color: s.hex || '#C8C8C8',
      barColor: s.hex || 'var(--accent-rose)',
    }))

  // Sales by category
  const catIdNameMap = new Map(
    ((productsWithCats as Array<{ id: string; categories: { name: string } | null }> | null) ?? [])
      .map(p => [p.id, (p.categories as { name: string } | null)?.name ?? 'Sin categoría'])
  )
  const catMap = new Map<string, number>()
  items.forEach(item => {
    const cat = (item.product_id ? catIdNameMap.get(item.product_id) : null) ?? 'Sin categoría'
    catMap.set(cat, (catMap.get(cat) ?? 0) + item.subtotal)
  })
  const categorySales = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ label: name, value, color: CAT_PALETTE[i % CAT_PALETTE.length] }))
  const totalCatRevenue = categorySales.reduce((s, c) => s + c.value, 0)

  // Orders by day of week (last 30 days)
  const weekdayCounts = Array.from({ length: 7 }, (_, i) => ({ label: WEEKDAYS[i], sublabel: '', value: 0, formattedValue: '' }))
  allOrders
    .filter(o => new Date(o.created_at) >= ago30)
    .forEach(o => { weekdayCounts[new Date(o.created_at).getDay()].value++ })
  weekdayCounts.forEach(d => { d.formattedValue = `${d.value} pedidos` })

  // Recurring vs new customers (last 60 days)
  const emailCount = new Map<string, number>()
  allOrders.forEach(o => {
    if (o.customer_email) emailCount.set(o.customer_email, (emailCount.get(o.customer_email) ?? 0) + 1)
  })
  const recurringCount = [...emailCount.values()].filter(n => n > 1).length
  const newCount = [...emailCount.values()].filter(n => n === 1).length

  // ── Análisis financiero: inversión, ganancia, margen ─────────────────────────

  let totalInvestment = 0
  let revenueWithCost = 0
  const brandRevenueMap = new Map<string, number>()

  items.forEach(item => {
    const meta = item.product_id ? productMeta.get(item.product_id) : null
    if (meta?.cost_price) {
      totalInvestment += meta.cost_price * item.quantity
      revenueWithCost += item.subtotal
    }
    const brand = meta?.brand?.trim() || 'Sin marca'
    brandRevenueMap.set(brand, (brandRevenueMap.get(brand) ?? 0) + item.subtotal)
  })

  const revenueFor30d = items.reduce((s, i) => s + i.subtotal, 0)
  const grossProfit = revenueWithCost - totalInvestment
  const marginPct = revenueWithCost > 0 ? (grossProfit / revenueWithCost) * 100 : null
  const hasCostData = totalInvestment > 0

  const topBrands = [...brandRevenueMap.entries()]
    .filter(([name]) => name !== 'Sin marca')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value, formattedValue: formatPrice(value) }))

  // Products without sales in last 30 days
  const soldIds = new Set(items.map(i => i.product_id).filter(Boolean))
  const noSalesProducts = ((activeProds as Array<{ id: string; name: string }> | null) ?? [])
    .filter(p => !soldIds.has(p.id))
    .map(p => p.name)
    .slice(0, 5)

  const recent = (recentRows as Array<{ id: string; order_number: string; customer_name: string; status: OrderStatus; total: number; created_at: string }> | null) ?? []
  const lowStockRows = (lowStock as LowStockRow[] | null) ?? []
  const hasPending = (pendingPayment ?? 0) > 0

  // ── Layout ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-px h-4 bg-accent" />
          <p className="font-body text-xs text-accent uppercase tracking-widest">Bienvenida</p>
        </div>
        <h1 className="font-display text-3xl text-fg">Dashboard</h1>
      </div>

      {/* Low stock alert */}
      {lowStockRows.length > 0 && (
        <div className="bg-warning/8 border border-warning/25 rounded-2xl px-5 py-4 flex gap-4">
          <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-medium text-warning mb-1.5">
              Stock bajo en {lowStockRows.length} producto{lowStockRows.length > 1 ? 's' : ''}
            </p>
            <ul className="space-y-0.5 mb-2">
              {lowStockRows.map(row => (
                <li key={row.product_id} className="font-body text-sm text-fg-2">
                  {row.product_name}{' '}
                  <span className="text-warning font-medium">
                    ({row.total_stock === 0 ? 'Agotado' : `${row.min_shade_stock} und. mínimo`})
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/admin/inventario" className="inline-flex items-center gap-1 text-xs font-body text-warning hover:opacity-80">
              Ver inventario <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Metric cards — fila 1 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          <p className="font-display text-3xl text-fg leading-none mb-1.5">{activeProductCount ?? 0}</p>
          <p className="font-body text-xs text-fg-3">Productos activos</p>
        </div>
      </div>

      {/* ── Metric cards — fila 2 (análisis) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart2}
          label="vs. mes anterior"
          value={salesLastMonth > 0 ? `${monthTrend! >= 0 ? '+' : ''}${monthTrend!.toFixed(1)}%` : '—'}
          sublabel={salesLastMonth > 0 ? `Antes: ${formatPrice(salesLastMonth)}` : 'Sin datos del mes anterior'}
          trend={monthTrend}
          accent={!!monthTrend && monthTrend > 0}
          iconColor={monthTrend === undefined ? 'text-fg-3' : monthTrend > 0 ? 'text-success' : 'text-error'}
        />
        <StatCard
          icon={ShoppingCart}
          label="Valor promedio por pedido"
          value={formatPrice(avgOrderValue)}
          sublabel={`${paidThisMonth.length} pedido${paidThisMonth.length !== 1 ? 's' : ''} pagados este mes`}
          iconColor="text-gold"
        />
        <StatCard
          icon={XCircle}
          label="Tasa de cancelación"
          value={`${cancellationRate.toFixed(1)}%`}
          sublabel={`${cancelledThisMonth} de ${totalThisMonth.length} pedidos este mes`}
          iconColor={cancellationRate > 20 ? 'text-error' : 'text-fg-3'}
        />
        <StatCard
          icon={Target}
          label="Proyección fin de mes"
          value={formatPrice(projection)}
          sublabel={`Día ${daysElapsed} de ${daysInMonth}`}
          iconColor="text-accent"
        />
      </div>

      {/* ── Fila 3: Inversión · Ganancia · Margen ── */}
      {hasCostData ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-rim rounded-2xl p-5 hover:border-rim-2 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
                <Wallet size={15} className="text-warning" strokeWidth={1.5} />
              </div>
              <p className="font-body text-[11px] text-fg-3">Inversión (30 días)</p>
            </div>
            <p className="font-display text-2xl text-fg leading-none">{formatPrice(totalInvestment)}</p>
            <p className="font-body text-[10px] text-fg-3 mt-1.5 italic">
              Costo total de lo vendido
            </p>
          </div>

          <div className="bg-card border border-rim rounded-2xl p-5 hover:border-rim-2 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp size={15} className="text-success" strokeWidth={1.5} />
              </div>
              <p className="font-body text-[11px] text-fg-3">Ganancia bruta (30 días)</p>
            </div>
            <p className={`font-display text-2xl leading-none ${grossProfit >= 0 ? 'text-success' : 'text-error'}`}>
              {formatPrice(grossProfit)}
            </p>
            <p className="font-body text-[10px] text-fg-3 mt-1.5 italic">
              Ingresos − inversión · {formatPrice(revenueWithCost)} facturado
            </p>
          </div>

          <div className="bg-card border border-rim rounded-2xl p-5 hover:border-rim-2 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Percent size={15} className="text-accent" strokeWidth={1.5} />
              </div>
              <p className="font-body text-[11px] text-fg-3">Margen de ganancia</p>
            </div>
            <p className={`font-display text-2xl leading-none ${(marginPct ?? 0) >= 0 ? 'text-accent' : 'text-error'}`}>
              {marginPct !== null ? `${marginPct.toFixed(1)}%` : '—'}
            </p>
            <p className="font-body text-[10px] text-fg-3 mt-1.5 italic">
              Solo productos con costo registrado
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-rim rounded-2xl p-5 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-alt flex items-center justify-center shrink-0">
            <Wallet size={16} className="text-fg-3" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-body text-sm font-medium text-fg">Análisis financiero no disponible</p>
            <p className="font-body text-xs text-fg-3 mt-0.5">
              Registra el precio de costo en los productos para ver inversión, ganancia y margen.
            </p>
          </div>
        </div>
      )}

      {/* ── Gráfica de ingresos ── */}
      <div className="bg-card border border-rim rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-px h-4 bg-accent" />
          <h2 className="font-body text-sm font-medium text-fg">Ingresos últimos 30 días</h2>
        </div>
        <RevenueChart data={dailyRevenue} />
      </div>

      {/* ── Donuts + días de la semana ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pedidos por estado */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Pedidos por estado</h2>
          </div>
          <DonutChart
            segments={statusDist}
            centerValue={totalOrders30d}
            centerLabel="últimos 30d"
          />
        </div>

        {/* Ventas por categoría */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Ventas por categoría</h2>
          </div>
          {categorySales.length > 0 ? (
            <DonutChart
              segments={categorySales.map(c => ({ ...c, value: c.value }))}
              centerValue={formatPrice(totalCatRevenue).replace('$ ', '$')}
              centerLabel="total"
            />
          ) : (
            <p className="font-body text-xs text-fg-3 text-center py-8">Sin ventas registradas</p>
          )}
        </div>

        {/* Pedidos por día de semana */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Pedidos por día</h2>
          </div>
          <HorizontalBars items={weekdayCounts} emptyMessage="Sin pedidos en 30 días" />
        </div>
      </div>

      {/* ── Top productos + top tonos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Top 5 productos (30 días)</h2>
          </div>
          <HorizontalBars items={topProducts} emptyMessage="Sin ventas registradas" />
        </div>

        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Top 5 tonos más pedidos</h2>
          </div>
          <HorizontalBars items={topShades} emptyMessage="Sin ventas registradas" />
        </div>
      </div>

      {/* ── Top marcas ── */}
      {topBrands.length > 0 && (
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-px h-4 bg-accent" />
            <Tag size={13} className="text-fg-3" strokeWidth={1.5} />
            <h2 className="font-body text-sm font-medium text-fg">Marcas más vendidas (30 días)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {topBrands.map((brand, i) => {
              const max = topBrands[0].value
              const pct = max > 0 ? (brand.value / max) * 100 : 0
              return (
                <div key={brand.label} className="py-2 border-b border-rim last:border-0 sm:last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body text-[10px] text-fg-3 tabular-nums w-4 shrink-0">{i + 1}</span>
                      <span className="font-body text-sm text-fg truncate">{brand.label}</span>
                    </div>
                    <span className="font-body text-xs font-medium text-gold shrink-0 ml-3 tabular-nums">
                      {brand.formattedValue}
                    </span>
                  </div>
                  <div className="ml-6 h-1 rounded-full bg-alt overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Clientes + sin ventas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clientas nuevas vs recurrentes */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Clientas (últimos 60 días)</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-alt rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-2">
                <Users size={15} className="text-accent" />
              </div>
              <p className="font-display text-2xl text-fg">{newCount}</p>
              <p className="font-body text-xs text-fg-3 mt-0.5">Nuevas</p>
            </div>
            <div className="bg-alt rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center mx-auto mb-2">
                <Repeat2 size={15} className="text-success" />
              </div>
              <p className="font-display text-2xl text-fg">{recurringCount}</p>
              <p className="font-body text-xs text-fg-3 mt-0.5">Recurrentes</p>
            </div>
          </div>
          {recurringCount + newCount > 0 && (
            <div className="mt-3 h-2 rounded-full bg-alt overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${(recurringCount / (recurringCount + newCount)) * 100}%` }}
              />
            </div>
          )}
          {recurringCount + newCount > 0 && (
            <p className="font-body text-[10px] text-fg-3 mt-1 text-right">
              {((recurringCount / (recurringCount + newCount)) * 100).toFixed(0)}% de retención
            </p>
          )}
        </div>

        {/* Productos sin ventas */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Activos sin ventas (30 días)</h2>
          </div>
          {noSalesProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CalendarDays size={28} className="text-success" strokeWidth={1} />
              <p className="font-body text-xs text-success font-medium">¡Todos los productos tuvieron ventas!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {noSalesProducts.map(name => (
                <div key={name} className="flex items-center gap-2 py-1.5 border-b border-rim last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  <p className="font-body text-xs text-fg-2">{name}</p>
                </div>
              ))}
              {((activeProds as Array<{ id: string; name: string }> | null)?.length ?? 0) - soldIds.size > 5 && (
                <Link href="/admin/productos" className="font-body text-xs text-accent hover:opacity-80">
                  Ver todos →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Pedidos recientes ── */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rim">
          <div className="flex items-center gap-2.5">
            <div className="w-px h-4 bg-accent" />
            <h2 className="font-body text-sm font-medium text-fg">Pedidos recientes</h2>
          </div>
          <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-xs font-body text-accent hover:opacity-80">
            Ver todos <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-14 text-center">
            <ShoppingBag size={32} className="text-fg-3 mx-auto mb-3" strokeWidth={1} />
            <p className="font-body text-sm text-fg-3">No hay pedidos aún</p>
          </div>
        ) : (
          <div className="divide-y divide-rim">
            {recent.map(order => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className={`flex items-center justify-between px-6 py-3.5 hover:bg-highlight/40 transition-colors ${order.status === 'pending_payment' ? 'bg-highlight/20' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-body text-sm font-medium text-fg shrink-0 tabular-nums">
                    #{order.order_number}
                  </span>
                  <span className="font-body text-sm text-fg-2 truncate">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-[11px] font-body font-medium px-2.5 py-1 rounded-full hidden sm:inline-flex ${STATUS_BADGE[order.status]}`}>
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
          <Link href="/admin/pedidos" className="inline-flex items-center gap-1.5 text-xs font-body text-fg-3 hover:text-fg transition-colors">
            Ver todos los pedidos <ArrowRight size={11} />
          </Link>
        </div>
      </div>

    </div>
  )
}
