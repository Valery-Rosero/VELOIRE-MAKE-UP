'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { deleteProduct } from '@/app/admin/productos/actions'
import { useConfirmAction } from '@/hooks/useConfirmAction'

interface Props {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: Props) {
  const { showModal, isPending, error, open, close, confirm } = useConfirmAction(
    async () => {
      const result = await deleteProduct(productId)
      if (result.error === 'ACTIVE_ORDERS') {
        return { error: 'No puedes eliminar este producto porque tiene pedidos en proceso. Desactívalo en su lugar.' }
      }
      if (result.error) {
        return { error: 'Error al eliminar. Inténtalo de nuevo.' }
      }
    },
    () => {}
  )

  return (
    <>
      <button
        onClick={open}
        className="text-fg-3 hover:text-error transition-colors"
        aria-label="Eliminar producto"
      >
        <Trash2 size={15} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-rim">
            <h2 className="font-display text-lg text-fg mb-2">¿Eliminar este producto?</h2>
            <p className="font-body text-sm text-fg-2 mb-1">
              <span className="font-medium text-fg">&ldquo;{productName}&rdquo;</span> desaparecerá de la tienda.
            </p>
            <p className="font-body text-sm text-fg-3 mb-4">Esta acción no se puede deshacer.</p>

            {error && (
              <p className="text-sm font-body text-error bg-error/10 rounded-xl px-3 py-2.5 mb-4 leading-relaxed">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={close}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-rim text-sm font-body text-fg-2 hover:border-rim-2 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
