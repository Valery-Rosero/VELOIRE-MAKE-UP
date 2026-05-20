'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => (b.is_main ? 1 : -1))
  const [active, setActive] = useState(sorted[0]?.url ?? null)

  if (!active) {
    return (
      <div className="aspect-square rounded-2xl bg-nude flex items-center justify-center">
        <span className="font-display text-4xl text-accent/30 select-none">V</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-nude">
        <Image src={active} alt={productName} fill className="object-cover" />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2">
          {sorted.map((img) => (
            <button
              key={img.url}
              onClick={() => setActive(img.url)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                active === img.url ? 'border-accent' : 'border-transparent hover:border-rim-2'
              }`}
            >
              <Image src={img.url} alt={img.alt_text ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
