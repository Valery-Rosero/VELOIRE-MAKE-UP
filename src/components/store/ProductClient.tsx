'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ProductDetail, ProductShade } from '@/types/product'
import { ProductGallery } from './ProductGallery'
import { ShadeSelector } from './ShadeSelector'
import { ProductActions } from './ProductActions'
import { ProductDescription } from './ProductDescription'

interface ProductClientProps {
  product: ProductDetail
}

export function ProductClient({ product }: ProductClientProps) {
  const activeShades = product.product_shades
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const firstInStock = activeShades.find((s) => s.stock > 0) ?? activeShades[0] ?? null
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(firstInStock)

  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  const shadeImageUrl = selectedShade?.image_url ?? null
  const mainImage =
    product.product_images.find((img) => img.is_main) ?? product.product_images[0]

  return (
    <>
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-xs font-body text-fg-3 mb-6 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-accent transition-colors">
          Inicio
        </Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/catalogo" className="hover:text-accent transition-colors">
          Catálogo
        </Link>
        {product.categories && (
          <>
            <ChevronRight size={12} aria-hidden />
            <Link
              href={`/catalogo?categoria=${product.categories.slug}`}
              className="hover:text-accent transition-colors"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} aria-hidden />
        <span className="text-fg-2 truncate max-w-40">{product.name}</span>
      </nav>

      {/* Two-column grid: 55% gallery / 45% info */}
      <div className="grid grid-cols-1 md:grid-cols-[11fr_9fr] gap-8 md:gap-12 lg:gap-16">
        {/* Gallery */}
        <ProductGallery
          images={product.product_images}
          shadeImageUrl={shadeImageUrl}
          productName={product.name}
        />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category pill */}
          {product.categories && (
            <Link
              href={`/catalogo?categoria=${product.categories.slug}`}
              className="text-xs font-body font-medium text-accent uppercase tracking-wide hover:underline underline-offset-4 w-fit"
            >
              {product.categories.name}
            </Link>
          )}

          {/* Product name */}
          <h1 className="font-display text-3xl md:text-4xl text-fg leading-snug">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-body text-2xl font-semibold text-gold">
              ${product.price.toLocaleString('es-CO')}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="font-body text-base text-fg-3 line-through">
                  ${product.compare_price.toLocaleString('es-CO')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gold-light text-gold text-xs font-body font-medium">
                  −{discountPct}%
                </span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          {activeShades.length > 0 && selectedShade && (
            <p className="text-xs font-body flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  selectedShade.stock > 5
                    ? 'bg-success'
                    : selectedShade.stock > 0
                    ? 'bg-warning'
                    : 'bg-error'
                }`}
              />
              <span className={selectedShade.stock === 0 ? 'text-error' : 'text-fg-3'}>
                {selectedShade.stock === 0 ? 'Agotado' : `${selectedShade.stock} disponibles`}
              </span>
            </p>
          )}

          {/* Description */}
          {product.description && (
            <ProductDescription description={product.description} />
          )}

          <hr className="border-rim" />

          {/* Shade selector */}
          {activeShades.length > 0 && (
            <div>
              <p className="text-sm font-body font-medium text-fg mb-2.5">
                Tono:{' '}
                <span className="font-normal text-fg-2">{selectedShade?.name ?? '—'}</span>
              </p>
              <ShadeSelector
                shades={activeShades}
                selectedShade={selectedShade}
                onSelect={setSelectedShade}
              />
            </div>
          )}

          {/* Actions */}
          <ProductActions
            productId={product.id}
            productName={product.name}
            price={product.price}
            imageUrl={mainImage?.url ?? null}
            selectedShade={selectedShade}
          />

          {/* Info bullets */}
          <div className="mt-2 space-y-1.5">
            <p className="text-xs font-body text-fg-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              Envíos a Pasto · Pago por Nequi o Bancolombia
            </p>
            <p className="text-xs font-body text-fg-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              Atención personalizada por WhatsApp
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
