'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/format'

interface Props {
  orderId: string
  orderNumber: string
  total: number
  customerEmail: string
}

export function ConfirmPaymentButton({ orderId, orderNumber, total, customerEmail }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid' }),
        })
        if (!res.ok) throw new Error()
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, type: 'payment_confirmed' }),
        })
        setShowModal(false)
        router.refresh()
      } catch {
        setError('Ocurrió un error. Intenta de nuevo.')
      }
    })
  }

  return (
    <>
      <div className="bg-card border-2 border-warning/40 rounded-2xl p-5">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-1">
          Esperando pago
        </p>
        <p className="font-body text-sm text-fg-2 mb-4">
          Cuando recibas la transferencia por Nequi, confirma el pago aquí.
        </p>
        <p className="font-display text-3xl text-gold mb-5">{formatPrice(total)}</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-success text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          <CheckCircle size={16} />
          Confirmar pago recibido
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-card border border-rim rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-display text-lg text-fg">Confirmar pago</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-fg-3 hover:text-fg transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <p className="font-body text-sm text-fg-2 mb-1">
              Pedido <span className="font-medium text-fg">#{orderNumber}</span>
            </p>
            <p className="font-body text-sm text-fg-2 mb-4">{customerEmail}</p>
            <p className="font-display text-2xl text-gold mb-4">{formatPrice(total)}</p>

            <p className="font-body text-xs text-fg-3 mb-5">
              Al confirmar, el estado del pedido cambiará a "Pago confirmado" y se notificará al cliente.
            </p>

            {error && (
              <p className="font-body text-xs text-error mb-3">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-xl border border-rim text-sm font-body text-fg-2 hover:border-rim-2 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-success text-white text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
