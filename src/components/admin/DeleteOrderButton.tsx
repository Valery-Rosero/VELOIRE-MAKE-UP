'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { deleteOrder } from '@/app/admin/pedidos/actions'

interface Props {
  orderId: string
}

export function DeleteOrderButton({ orderId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  function handleConfirm() {
    setErrorMsg(null)
    startTransition(async () => {
      const result = await deleteOrder(orderId)
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
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-error/30 text-error text-sm font-body font-medium hover:bg-error/10 transition-colors"
      >
        <Trash2 size={14} />
        Eliminar pedido
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="del-bg"
              className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isPending) setShowModal(false) }}
            />
            <motion.div
              key="del-modal"
              className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-card border border-rim rounded-2xl p-6 max-w-xs w-full shadow-2xl pointer-events-auto">
                <h2 className="font-display text-xl text-fg mb-1">¿Eliminar pedido?</h2>
                <p className="font-body text-sm text-fg-2 mb-5 leading-relaxed">
                  El pedido y todos sus registros se eliminarán permanentemente. Esta acción no se puede deshacer.
                </p>
                {errorMsg && (
                  <p className="font-body text-xs text-error mb-3">{errorMsg}</p>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl bg-error text-white text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isPending ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isPending}
                    className="text-sm font-body text-fg-3 hover:text-fg transition-colors py-2"
                  >
                    Cancelar
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
