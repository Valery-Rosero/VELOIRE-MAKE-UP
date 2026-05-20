'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ProductCardProps {
  slug: string
  name: string
  price: number
  comparePrice?: number | null
  imageUrl?: string | null
  imageAlt?: string | null
  categoryName?: string | null
  shadeCount?: number
  totalStock?: number
  index?: number
}

export function ProductCard({
  slug,
  name,
  price,
  comparePrice,
  imageUrl,
  imageAlt,
  categoryName,
  shadeCount,
  totalStock,
  index = 0,
}: ProductCardProps) {
  const isOutOfStock = totalStock !== undefined && totalStock === 0
  const discountPct =
    comparePrice && comparePrice > price
      ? Math.round((1 - price / comparePrice) * 100)
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Link href={`/producto/${slug}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-nude">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-60' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-4xl text-rose-medium select-none">V</span>
            </div>
          )}

          {/* Badges sobre imagen */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {categoryName && (
              <span className="px-2 py-0.5 rounded-full bg-rose-light text-rose-dark text-[11px] font-body font-medium leading-tight">
                {categoryName}
              </span>
            )}
            {discountPct && (
              <span className="px-2 py-0.5 rounded-full bg-gold-light text-gold text-[11px] font-body font-medium leading-tight">
                −{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 rounded-full bg-alt text-fg-3 text-[11px] font-body font-medium leading-tight">
                Agotado
              </span>
            )}
          </div>

          {/* Botón hover (desktop) / siempre visible (móvil) */}
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 md:transition-transform md:duration-200 md:ease-out">
            <div className="bg-accent text-white text-xs font-body font-medium text-center py-2 rounded-lg">
              Ver producto
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <h3 className="font-display text-sm font-normal text-fg group-hover:text-accent transition-colors duration-150 leading-snug">
            {name}
          </h3>
          {shadeCount !== undefined && shadeCount > 0 && (
            <p className="text-[11px] font-body text-fg-2 mt-0.5">
              {shadeCount} {shadeCount === 1 ? 'tono' : 'tonos'}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-body font-medium text-accent-gold">
              ${price.toLocaleString('es-CO')}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs font-body text-fg-3 line-through">
                ${comparePrice.toLocaleString('es-CO')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
