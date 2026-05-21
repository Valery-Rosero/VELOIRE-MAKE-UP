import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'
import { ConfirmPaymentButton } from '@/components/admin/ConfirmPaymentButton'
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

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending_payment', label: 'Pedido creado' },
  { status: 'paid', label: 'Pago confirmado' },
  { status: 'preparing', label: 'En preparación' },
  { status: 'shipped', label: 'En camino' },
  { status: 'delivered', label: 'Entregado' },
]

const STATUS_ORDER: OrderStatus[] = ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered']

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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetallePedidoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data: rows } = await supabase
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
    .limit(1)

  const order = (rows as Order[] | null)?.[0]
  if (!order) notFound()

  const currentIndex = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  function getTimestampForStep(status: OrderStatus): string | null {
    if (status === 'pending_payment') return formatDate(order.created_at)
    if (status === 'paid' && order.payment_confirmed_at) return formatDate(order.payment_confirmed_at)
    return null
  }

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
      <div className="mb-4">
        {order.status === 'pending_payment' ? (
          <ConfirmPaymentButton
            orderId={order.id}
            orderNumber={order.order_number}
            total={order.total}
            customerEmail={order.customer_email}
          />
        ) : (
          <div className="bg-card border border-rim rounded-2xl p-5">
            <p className="font-body text-sm font-medium text-fg mb-3">Actualizar estado</p>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            {order.payment_confirmed_at && (
              <p className="font-body text-xs text-fg-3 mt-3">
                Pago confirmado: {formatDate(order.payment_confirmed_at)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card border border-rim rounded-2xl p-5 mb-4">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-4">
          Historial
        </p>
        <div className="relative">
          {TIMELINE_STEPS.map((step, i) => {
            const stepIndex = STATUS_ORDER.indexOf(step.status)
            const isDone = !isCancelled && stepIndex < currentIndex
            const isCurrent = !isCancelled && stepIndex === currentIndex
            const isFuture = isCancelled || stepIndex > currentIndex
            const isLast = i === TIMELINE_STEPS.length - 1
            const timestamp = getTimestampForStep(step.status)

            return (
              <div key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
                      isDone
                        ? 'bg-success border-success'
                        : isCurrent
                        ? 'bg-accent border-accent'
                        : 'bg-card border-rim'
                    }`}
                  />
                  {!isLast && (
                    <div
                      className={`w-px flex-1 my-1 ${
                        isDone ? 'bg-success/40' : 'bg-rim'
                      }`}
                    />
                  )}
                </div>
                <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                  <p
                    className={`font-body text-sm leading-tight ${
                      isFuture && !isCurrent ? 'text-fg-3' : 'text-fg'
                    }`}
                  >
                    {step.label}
                  </p>
                  {timestamp && (
                    <p className="font-body text-xs text-fg-3 mt-0.5">{timestamp}</p>
                  )}
                </div>
              </div>
            )
          })}
          {isCancelled && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 bg-error border-error shrink-0 mt-0.5" />
              </div>
              <div>
                <p className="font-body text-sm text-error">Cancelado</p>
              </div>
            </div>
          )}
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
            <p className="font-body text-sm text-fg-3 mt-2 italic">"{order.notes}"</p>
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
      </div>
    </div>
  )
}
