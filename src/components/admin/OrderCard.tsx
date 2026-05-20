import { Badge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/database'
import Link from 'next/link'

interface OrderCardProps {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName: string
  total: number
  createdAt: string
  itemCount: number
}

export function OrderCard({ id, orderNumber, status, customerName, total, createdAt, itemCount }: OrderCardProps) {
  return (
    <Link
      href={`/admin/pedidos/${id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-rose/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">#{orderNumber}</p>
          <p className="text-sm text-gray-500 mt-0.5">{customerName}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {' · '}{itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <div className="text-right space-y-2">
          <p className="font-semibold">${total.toLocaleString('es-CO')}</p>
          <Badge status={status} />
        </div>
      </div>
    </Link>
  )
}
