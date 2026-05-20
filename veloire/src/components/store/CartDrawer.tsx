'use client'

import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/Button'
import { Trash2, X } from 'lucide-react'
import Link from 'next/link'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCartStore()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-rim shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-rim">
          <h2 className="font-display text-xl text-fg">Carrito</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-3 hover:text-fg hover:bg-highlight transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center font-body text-sm text-fg-3 mt-12">Tu carrito está vacío</p>
          ) : items.map((item) => (
            <div key={item.shadeId} className="flex gap-3 items-center">
              <span
                className="w-5 h-5 rounded-full border border-rim shrink-0"
                style={{ backgroundColor: item.shadeHex }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-fg truncate">{item.productName}</p>
                <p className="font-body text-xs text-fg-2">{item.shadeName}</p>
                <p className="font-body text-xs font-medium text-accent-gold mt-0.5">
                  ${item.unitPrice.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => updateQuantity(item.shadeId, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center rounded border border-rim text-fg-2 hover:border-rim-2 hover:text-fg transition-colors text-sm"
                >
                  −
                </button>
                <span className="font-body text-sm w-5 text-center text-fg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.shadeId, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center rounded border border-rim text-fg-2 hover:border-rim-2 hover:text-fg transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.shadeId)}
                className="text-fg-3 hover:text-error transition-colors ml-1"
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-rim space-y-3">
            <div className="flex justify-between font-body text-sm font-semibold text-fg">
              <span>Total</span>
              <span>${total().toLocaleString('es-CO')}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full">Ir al checkout</Button>
            </Link>
            <Link
              href="/carrito"
              onClick={onClose}
              className="block text-center text-xs font-body text-fg-2 hover:text-accent transition-colors"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
