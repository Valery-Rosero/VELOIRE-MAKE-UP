'use client'

import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { ShadeSelector } from './ShadeSelector'
import { useCartStore } from '@/lib/store/cart'

interface Shade {
  id: string
  name: string
  hex_color: string
  stock: number
  is_active: boolean
}

interface ProductActionsProps {
  productId: string
  productName: string
  price: number
  imageUrl: string | null
  shades: Shade[]
}

export function ProductActions({ productId, productName, price, imageUrl, shades }: ProductActionsProps) {
  const activeShades = shades.filter((s) => s.is_active)
  const hasShades = activeShades.length > 0

  const [selectedShadeId, setSelectedShadeId] = useState<string | null>(
    hasShades ? activeShades[0].id : null
  )
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const selectedShade = activeShades.find((s) => s.id === selectedShadeId) ?? null
  const outOfStock = selectedShade ? selectedShade.stock === 0 : !hasShades

  function handleAddToCart() {
    if (!selectedShade || outOfStock) return

    addItem({
      productId,
      shadeId: selectedShade.id,
      productName,
      shadeName: selectedShade.name,
      shadeHex: selectedShade.hex_color,
      imageUrl,
      unitPrice: price,
      quantity: 1,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Selector de tono */}
      {hasShades && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-body font-medium text-fg">
              Tono:{' '}
              <span className="text-fg-2 font-normal">{selectedShade?.name ?? '—'}</span>
            </p>
            <span className="text-xs font-body text-fg-3">
              {selectedShade && selectedShade.stock > 0
                ? `${selectedShade.stock} disponibles`
                : 'Agotado'}
            </span>
          </div>
          <ShadeSelector
            shades={activeShades}
            selectedShadeId={selectedShadeId}
            onSelect={setSelectedShadeId}
          />
        </div>
      )}

      {/* Botón añadir */}
      <button
        onClick={handleAddToCart}
        disabled={outOfStock || added}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-body font-medium transition-all duration-200 ${
          added
            ? 'bg-success text-white'
            : outOfStock
            ? 'bg-alt text-fg-3 cursor-not-allowed'
            : 'bg-accent text-white hover:opacity-90 active:scale-[0.98]'
        }`}
      >
        {added ? (
          <>
            <Check size={16} />
            Añadido al carrito
          </>
        ) : outOfStock ? (
          'Sin stock'
        ) : (
          <>
            <ShoppingBag size={16} />
            Añadir al carrito
          </>
        )}
      </button>
    </div>
  )
}
