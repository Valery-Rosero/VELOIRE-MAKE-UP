import type { OrderStatus, ProductStatus } from '@/types/database'

type Status = OrderStatus | ProductStatus | string

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  draft: 'Borrador',
  pending_payment: 'Pago pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export function Badge({ status }: { status: Status }) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-600'
  const label = statusLabels[status] ?? status

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}
