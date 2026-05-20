'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore()

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-fg-3 mb-4" />
        <h1 className="font-display text-2xl text-fg mb-2">Tu carrito está vacío</h1>
        <p className="font-body text-sm text-fg-2 mb-8">
          Agrega productos desde el catálogo para empezar.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Ver catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-fg mb-8">Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Lista */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.shadeId}
              className="flex gap-4 items-center bg-card border border-rim rounded-xl p-4"
            >
              {/* Imagen / color */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-alt shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: item.shadeHex }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-fg truncate">
                  {item.productName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="w-3 h-3 rounded-full border border-rim shrink-0"
                    style={{ backgroundColor: item.shadeHex }}
                  />
                  <span className="font-body text-xs text-fg-2">{item.shadeName}</span>
                </div>
                <p className="font-body text-sm font-medium text-accent-gold mt-1">
                  ${item.unitPrice.toLocaleString('es-CO')}
                </p>
              </div>

              {/* Cantidad */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => updateQuantity(item.shadeId, item.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-rim text-fg-2 hover:border-rim-2 hover:text-fg transition-colors text-sm"
                >
                  −
                </button>
                <span className="font-body text-sm w-5 text-center text-fg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.shadeId, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-rim text-fg-2 hover:border-rim-2 hover:text-fg transition-colors text-sm"
                >
                  +
                </button>
              </div>

              {/* Subtotal + eliminar */}
              <div className="text-right shrink-0 min-w-16">
                <p className="font-body text-sm font-medium text-fg">
                  ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                </p>
                <button
                  onClick={() => removeItem(item.shadeId)}
                  className="mt-1 text-fg-3 hover:text-error transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-card border border-rim rounded-xl p-6 h-fit space-y-4">
          <h2 className="font-display text-xl text-fg">Resumen</h2>

          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between text-fg-2">
              <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} uds.)</span>
              <span>${total().toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-fg-2">
              <span>Envío</span>
              <span className="text-success font-medium">A coordinar</span>
            </div>
          </div>

          <hr className="border-rim" />

          <div className="flex justify-between font-body font-semibold text-fg">
            <span>Total</span>
            <span>${total().toLocaleString('es-CO')}</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center py-3.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            Ir al checkout
          </Link>

          <Link
            href="/catalogo"
            className="block w-full text-center py-2 text-sm font-body text-fg-2 hover:text-accent transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  )
}
