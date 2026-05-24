'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { cancelOrder } from '@/app/admin/pedidos/actions'

interface Props {
  orderId: string
}

export function CancelOrderButton({ orderId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  function handleConfirm() {
    setErrorMsg(null)
    startTransition(async () => {
      const result = await cancelOrder(orderId)
      if ('error' in result) {
        setErrorMsg(result.error)
      } else {
        router.push('/admin/pedidos')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-2.5 rounded-xl bg-error/10 text-error text-sm font-body font-medium hover:bg-error/20 transition-colors"
      >
        Cancelar pedido
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="cancel-bg"
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isPending) setShowModal(false) }}
            />
            <motion.div
              key="cancel-modal"
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-card border border-rim rounded-2xl p-6 max-w-xs w-full shadow-2xl pointer-events-auto">
                <h2 className="font-display text-xl text-fg mb-1">¿Cancelar pedido?</h2>
                <p className="font-body text-sm text-fg-2 mb-5 leading-relaxed">
                  Esta acción no se puede deshacer. El pedido quedará marcado como cancelado.
                </p>
                {errorMsg && (
                  <p className="font-body text-xs text-error mb-3">{errorMsg}</p>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl bg-error/10 text-error text-sm font-body font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Cancelando...' : 'Sí, cancelar pedido'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isPending}
                    className="text-sm font-body text-fg-3 hover:text-fg transition-colors py-2"
                  >
                    No, mantener pedido
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
