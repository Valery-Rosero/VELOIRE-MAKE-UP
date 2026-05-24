'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProductImage } from '@/types/product'

interface ProductGalleryProps {
  images: ProductImage[]
  shadeImageUrl: string | null
  productName: string
}

export function ProductGallery({ images, shadeImageUrl, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => (b.is_main ? 1 : -1))
  const defaultUrl = sorted[0]?.url ?? null

  const [activeUrl, setActiveUrl] = useState<string | null>(defaultUrl)

  // Render-body setState: sync activeUrl when shade image changes (avoids useEffect)
  const [prevShadeUrl, setPrevShadeUrl] = useState(shadeImageUrl)
  if (prevShadeUrl !== shadeImageUrl) {
    setPrevShadeUrl(shadeImageUrl)
    setActiveUrl(shadeImageUrl !== null ? shadeImageUrl : defaultUrl)
  }

  return (
    <div className="space-y-3">
      {/* Main image with crossfade */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-alt">
        {activeUrl ? (
          <AnimatePresence mode="sync">
            <motion.div
              key={activeUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={activeUrl}
                alt={productName}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl text-accent/30 select-none">V</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {sorted.map((img) => {
            const isActive = activeUrl === img.url
            return (
              <button
                key={img.url}
                onClick={() => setActiveUrl(img.url)}
                aria-label={img.alt_text ?? productName}
                aria-pressed={isActive}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                  isActive ? 'border-accent' : 'border-transparent hover:border-rim-2'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text ?? productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
