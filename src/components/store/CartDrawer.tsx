'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Trash2, Minus, Plus, ShoppingBag, Lock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore, type CartItem } from '@/lib/store/cart'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  deliveryFee: number
  isLoggedIn: boolean
}

interface CartItemRowProps {
  item: CartItem
  onRemove: (shadeId: string) => void
  onUpdate: (shadeId: string, qty: number) => void
}

function CartItemRow({ item, onRemove, onUpdate }: CartItemRowProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 items-start pb-4 border-b border-rim last:border-0 last:pb-0"
    >
      {/* Imagen */}
      <div className="relative w-18 h-18 rounded-lg overflow-hidden bg-alt shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="72px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="w-6 h-6 rounded-full border border-white/30"
              style={{ backgroundColor: item.shadeHex }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium text-fg truncate">{item.productName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="w-3 h-3 rounded-full border border-rim shrink-0"
            style={{ backgroundColor: item.shadeHex }}
          />
          <span className="font-body text-xs text-fg-2">{item.shadeName}</span>
        </div>
        <p className="font-body text-xs font-medium text-gold mt-1">
          ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
        </p>

        {/* Controles de cantidad */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => onUpdate(item.shadeId, item.quantity - 1)}
            aria-label="Reducir cantidad"
            className="w-6 h-6 flex items-center justify-center rounded border border-rim text-fg-2 hover:border-rim-2 hover:text-fg transition-colors disabled:opacity-30"
            disabled={item.quantity <= 1}
          >
            <Minus size={10} />
          </button>
          <span className="font-body text-sm w-5 text-center text-fg select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdate(item.shadeId, item.quantity + 1)}
            aria-label="Aumentar cantidad"
            disabled={item.quantity >= (item.stock ?? Infinity)}
            className="w-6 h-6 flex items-center justify-center rounded border border-rim text-fg-2 hover:border-rim-2 hover:text-fg transition-colors disabled:opacity-30"
          >
            <Plus size={10} />
          </button>
          {item.stock != null && item.quantity >= item.stock && (
            <span className="font-body text-[10px] text-warning ml-1">máx.</span>
          )}
        </div>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(item.shadeId)}
        aria-label={`Eliminar ${item.productName}`}
        className="text-fg-3 hover:text-error transition-colors mt-0.5 shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </motion.li>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  const router = useRouter()

  function handleGoToCollection() {
    onClose()
    router.push('/catalogo')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <ShoppingBag size={48} className="text-fg-3 mb-4" strokeWidth={1.5} />
      <p className="font-body text-[15px] text-fg mb-1">Tu carrito está vacío</p>
      <p className="font-body text-xs text-fg-3 leading-relaxed mb-6 max-w-55">
        Explora nuestra colección y encuentra tu tono perfecto
      </p>
      <button
        onClick={handleGoToCollection}
        className="px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
      >
        Ver colección
      </button>
    </div>
  )
}

export function CartDrawer({ open, onClose, deliveryFee, isLoggedIn }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCartStore()

  const subtotal = total()
  const grandTotal = subtotal + deliveryFee
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-105 bg-card border-l border-rim shadow-2xl z-50 flex flex-col"
            aria-label="Carrito de compras"
          >
            {/* Encabezado */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-rim shrink-0">
              <div>
                <h2 className="font-display text-lg text-fg">Tu carrito</h2>
                <p className="font-body text-xs text-fg-3 mt-0.5">
                  {itemCount === 0
                    ? 'Sin productos'
                    : `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-3 hover:text-fg hover:bg-highlight transition-colors mt-0.5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lista de ítems */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyCart onClose={onClose} />
              ) : (
                <motion.ul layout className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItemRow
                        key={item.shadeId}
                        item={item}
                        onRemove={removeItem}
                        onUpdate={updateQuantity}
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* Resumen sticky */}
            {items.length > 0 && (
              <div className="shrink-0 px-5 py-4 border-t border-rim bg-card space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-body text-sm text-fg-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm text-fg-2">
                    <span>Domicilio a Pasto</span>
                    <span>${deliveryFee.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <hr className="border-rim" />

                <div className="flex justify-between font-body text-base font-medium text-fg">
                  <span>Total</span>
                  <span className="text-gold font-semibold text-lg">
                    ${grandTotal.toLocaleString('es-CO')}
                  </span>
                </div>

                <Link
                  href={isLoggedIn ? '/checkout' : '/login?redirectTo=/checkout'}
                  onClick={onClose}
                  className="block w-full text-center py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
                >
                  {isLoggedIn ? 'Ir a pagar' : 'Iniciar sesión para comprar'}
                </Link>

                {!isLoggedIn && (
                  <p className="text-center text-xs font-body text-fg-3">
                    Tu carrito se guardará mientras inicias sesión
                  </p>
                )}

                <p className="flex items-center justify-center gap-1.5 text-xs font-body text-fg-3">
                  <Lock size={11} />
                  Pago seguro por Nequi
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
