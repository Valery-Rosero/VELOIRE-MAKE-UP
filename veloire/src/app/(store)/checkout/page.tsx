'use client'

import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { CheckoutForm } from '@/components/store/CheckoutForm'
import type { CheckoutInput } from '@/lib/validations/checkout'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-fg-3 mb-4" />
        <h1 className="font-display text-2xl text-fg mb-2">Carrito vacío</h1>
        <p className="font-body text-sm text-fg-2 mb-8">
          Agrega productos antes de continuar con el checkout.
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

  async function handleSubmit(data: CheckoutInput) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, items }),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(error ?? 'No se pudo crear el pedido')
    }

    const { orderNumber } = await res.json()
    clearCart()
    router.push(`/pedido/${orderNumber}`)
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-fg mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Formulario */}
        <div className="bg-card border border-rim rounded-xl p-6">
          <h2 className="font-display text-xl text-fg mb-5">Tus datos</h2>
          <CheckoutForm onSubmit={handleSubmit} />
        </div>

        {/* Resumen del pedido */}
        <div className="bg-card border border-rim rounded-xl p-6 space-y-4">
          <h2 className="font-display text-xl text-fg">Tu pedido</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.shadeId} className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full border border-rim shrink-0"
                  style={{ backgroundColor: item.shadeHex }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs font-medium text-fg truncate">
                    {item.productName}
                  </p>
                  <p className="font-body text-[11px] text-fg-2">{item.shadeName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-body text-xs text-fg-2">× {item.quantity}</p>
                  <p className="font-body text-xs font-medium text-fg">
                    ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-rim" />

          <div className="space-y-1.5 text-sm font-body">
            <div className="flex justify-between text-fg-2">
              <span>Subtotal</span>
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

          <p className="text-xs font-body text-fg-3 leading-relaxed">
            Al confirmar aceptas que nos contactaremos por WhatsApp para coordinar el pago y el envío.
          </p>
        </div>
      </div>
    </main>
  )
}
