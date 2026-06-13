import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'
import { ConfirmPaymentButton } from '@/components/admin/ConfirmPaymentButton'
import { CancelOrderButton } from '@/components/admin/CancelOrderButton'
import { DeleteOrderButton } from '@/components/admin/DeleteOrderButton'
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

interface OrderItem {
  id: string
  product_name: string
  shade_name: string
  shade_hex: string
  image_url: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  neighborhood: string
  city: string
  department: string
  notes: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: string
  payment_confirmed_at: string | null
  created_at: string
  order_items: OrderItem[]
}

interface HistoryEntry {
  status: OrderStatus
  note: string | null
  changed_at: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetallePedidoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createAdminClient()

  const [{ data: rows }, { data: historyRows }] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        id, order_number, status, customer_name, customer_email, customer_phone,
        address, neighborhood, city, department, notes,
        subtotal, delivery_fee, total, payment_method, payment_confirmed_at, created_at,
        order_items (
          id, product_name, shade_name, shade_hex, image_url, quantity, unit_price, subtotal
        )
      `)
      .eq('id', id)
      .limit(1),
    supabase
      .from('order_status_history')
      .select('status, note, changed_at')
      .eq('order_id', id)
      .order('changed_at', { ascending: true }),
  ])

  const order = (rows as Order[] | null)?.[0]
  if (!order) notFound()

  const history = (historyRows as HistoryEntry[] | null) ?? []

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          <ArrowLeft size={14} />
          Pedidos
        </Link>
        <span className="text-fg-3">/</span>
        <span className="font-body text-sm text-fg">#{order.order_number}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-fg mb-1">Pedido #{order.order_number}</h1>
          <p className="font-body text-sm text-fg-2">{formatDate(order.created_at)}</p>
        </div>
        <span
          className={`text-xs font-body font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Status actions */}
      <div className="mb-4 space-y-3">
        {order.status === 'pending_payment' && (
          <ConfirmPaymentButton
            orderId={order.id}
            orderNumber={order.order_number}
            total={order.total}
            customerEmail={order.customer_email}
          />
        )}

        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <>
            {order.status !== 'pending_payment' && (
              <div className="bg-card border border-rim rounded-2xl p-5">
                <p className="font-body text-sm font-medium text-fg mb-3">Actualizar estado</p>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </div>
            )}
            <div className="bg-card border border-rim rounded-2xl p-5">
              <p className="font-body text-sm font-medium text-fg mb-1">
                {order.status === 'pending_payment' ? 'Rechazar pedido' : 'Cancelar pedido'}
              </p>
              <p className="font-body text-xs text-fg-3 mb-3">
                Se restaurará el stock de los productos.
              </p>
              <CancelOrderButton orderId={order.id} />
            </div>
          </>
        )}

        {order.status === 'cancelled' && (
          <div className="bg-card border border-rim rounded-2xl p-5">
            <p className="font-body text-sm font-medium text-fg mb-1">Eliminar pedido</p>
            <p className="font-body text-xs text-fg-3 mb-3">
              Elimina permanentemente este pedido de la base de datos.
            </p>
            <DeleteOrderButton orderId={order.id} />
          </div>
        )}
      </div>

      {/* Timeline from order_status_history */}
      <div className="bg-card border border-rim rounded-2xl p-5 mb-4">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-4">
          Historial
        </p>
        <div className="relative">
          {/* Initial entry — always present */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full border-2 bg-success border-success shrink-0 mt-0.5" />
              {history.length > 0 && (
                <div className="w-px flex-1 my-1 bg-success/40" />
              )}
            </div>
            <div className={history.length > 0 ? 'pb-4' : ''}>
              <p className="font-body text-sm text-fg">Pedido creado</p>
              <p className="font-body text-xs text-fg-3 mt-0.5">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* History entries from DB trigger */}
          {history.map((entry, i) => {
            const isLast = i === history.length - 1
            const isCancelled = entry.status === 'cancelled'
            const isDone = !isLast
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full border-2 shrink-0 mt-0.5 ${
                      isCancelled
                        ? 'bg-error border-error'
                        : isDone
                        ? 'bg-success border-success'
                        : 'bg-accent border-accent'
                    }`}
                  />
                  {!isLast && (
                    <div className={`w-px flex-1 my-1 ${isDone ? 'bg-success/40' : 'bg-rim'}`} />
                  )}
                </div>
                <div className={!isLast ? 'pb-4' : ''}>
                  <p
                    className={`font-body text-sm ${isCancelled ? 'text-error' : 'text-fg'}`}
                  >
                    {STATUS_LABELS[entry.status]}
                  </p>
                  <p className="font-body text-xs text-fg-3 mt-0.5">{formatDate(entry.changed_at)}</p>
                  {entry.note && (
                    <p className="font-body text-xs text-fg-3 italic mt-0.5">&ldquo;{entry.note}&rdquo;</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Customer */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-3">Cliente</p>
          <p className="font-body text-sm font-medium text-fg mb-2">{order.customer_name}</p>
          <a
            href={`mailto:${order.customer_email}`}
            className="flex items-center gap-1.5 font-body text-sm text-fg-2 hover:text-accent transition-colors mb-1"
          >
            <Mail size={13} className="shrink-0" />
            {order.customer_email}
          </a>
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-1.5 font-body text-sm text-fg-2 hover:text-accent transition-colors"
          >
            <Phone size={13} className="shrink-0" />
            {order.customer_phone}
          </a>
        </div>

        {/* Delivery */}
        <div className="bg-card border border-rim rounded-2xl p-5">
          <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-3">Dirección</p>
          <p className="font-body text-sm text-fg">{order.address}</p>
          <p className="font-body text-sm text-fg-2">{order.neighborhood}</p>
          <p className="font-body text-sm text-fg-2">{order.city}, {order.department}</p>
          {order.notes && (
            <p className="font-body text-sm text-fg-3 mt-2 italic">&ldquo;{order.notes}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden mb-4">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide px-5 py-3.5 border-b border-rim">
          Productos
        </p>
        <div className="divide-y divide-rim">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              <div
                className="w-4 h-4 rounded-full shrink-0 border border-rim"
                style={{ backgroundColor: item.shade_hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-fg">{item.product_name}</p>
                <p className="font-body text-xs text-fg-3">{item.shade_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-body text-sm text-fg">
                  {item.quantity} × {formatPrice(item.unit_price)}
                </p>
                <p className="font-body text-sm font-medium text-fg">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-rim px-5 py-4 space-y-1.5">
          <div className="flex justify-between font-body text-sm text-fg-2">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-body text-sm text-fg-2">
            <span>Domicilio</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between font-body text-sm font-medium text-fg pt-1 border-t border-rim">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-card border border-rim rounded-2xl p-5">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-2">Pago</p>
        <p className="font-body text-sm text-fg capitalize">{order.payment_method}</p>
        {order.payment_confirmed_at && (
          <p className="font-body text-xs text-fg-3 mt-1">
            Confirmado: {formatDate(order.payment_confirmed_at)}
          </p>
        )}
      </div>
    </div>
  )
}
