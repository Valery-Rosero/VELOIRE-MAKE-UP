'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CarouselProduct } from '@/components/store/NewArrivalsCarousel'

// ─── Bolitas (fallback cuando no hay productos) ───────────────────────────────

const CIRCLES = [
  { color: '#8B2252', size: 220, top: '-5%',  left: '18%', delay: 0.2, dur: 4.0, float: 16, blur: '3px',  z: 1 },
  { color: '#ed4a89', size: 190, top: '28%',  left: '-6%', delay: 0.0, dur: 3.6, float: 15, blur: '2px',  z: 2 },
  { color: '#c08fa2', size: 145, top: '5%',   left: '50%', delay: 0.5, dur: 4.2, float: 12, blur: '0px',  z: 3 },
  { color: '#D4A76A', size: 115, top: '48%',  left: '36%', delay: 0.8, dur: 3.8, float: 10, blur: '0px',  z: 4 },
  { color: '#a56583', size: 88,  top: '58%',  left: '5%',  delay: 0.4, dur: 3.5, float: 8,  blur: '0px',  z: 5 },
  { color: '#f5b8cc', size: 70,  top: '0%',   left: '72%', delay: 0.7, dur: 4.1, float: 10, blur: '0px',  z: 5 },
  { color: '#2a2020', size: 55,  top: '68%',  left: '62%', delay: 1.0, dur: 3.9, float: 7,  blur: '0px',  z: 6 },
  { color: '#f5e1d3', size: 44,  top: '38%',  left: '78%', delay: 0.3, dur: 3.7, float: 8,  blur: '0px',  z: 5 },
] as const

// ─── Spotlight de producto ────────────────────────────────────────────────────

function ProductSpotlight({ products }: { products: CarouselProduct[] }) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    if (products.length <= 1) return
    const t = setInterval(() => {
      setDir(1)
      setIdx((i) => (i + 1) % products.length)
    }, 4500)
    return () => clearInterval(t)
  }, [products.length])

  const go = (next: number) => {
    setDir(next > idx ? 1 : -1)
    setIdx(next)
  }

  const p = products[idx]
  const img = p.product_images?.find((x) => x.is_main) ?? p.product_images?.[0]

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={p.id}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d * 24, opacity: 0, scale: 0.97 }),
            center: { x: 0, opacity: 1, scale: 1 },
            exit: (d: number) => ({ x: d * -24, opacity: 0, scale: 0.97 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Link href={`/producto/${p.slug}`} className="group block h-full">
            <div className="relative h-full rounded-3xl overflow-hidden bg-alt shadow-xl">
              {/* Imagen */}
              {img ? (
                <Image
                  src={img.url}
                  alt={img.alt_text ?? p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-alt">
                  <span className="font-display text-7xl text-accent select-none">V</span>
                </div>
              )}

              {/* Badge "Nuevo" */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-body font-semibold tracking-widest uppercase">
                  Nuevo
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dots de navegación */}
      {products.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); go(i) }}
              aria-label={`Producto ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/65'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  products?: CarouselProduct[]
}

export function HeroSection({ products = [] }: HeroSectionProps) {
  const hasProducts = products.length > 0

  return (
    <section
      className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-alt)',
        backgroundImage: `
          radial-gradient(circle at 75% 45%, rgba(192,143,162,0.10) 0%, transparent 55%),
          radial-gradient(circle at 12% 18%, rgba(165,101,131,0.07) 0%, transparent 45%)
        `,
      }}
    >
      {/* Manchas decorativas de fondo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 680, height: 680, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,143,162,0.09) 0%, transparent 70%)',
          right: '-10%', top: '50%', transform: 'translateY(-50%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165,101,131,0.07) 0%, transparent 70%)',
          left: '-6%', top: '-8%',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-10 items-center">

          {/* ── Columna izquierda ── */}
          <motion.div
            className="flex flex-col items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <p
              className="font-body text-[11px] uppercase text-accent mb-5"
              style={{ letterSpacing: '3px' }}
            >
              Hecho en Pasto, Nariño
            </p>

            <h1 className="font-display leading-[1.08] tracking-tight mb-6">
              <span className="block text-4xl md:text-5xl lg:text-[62px] text-fg">El maquillaje</span>
              <span className="block text-4xl md:text-5xl lg:text-[62px] text-fg">que te hace</span>
              <span className="block text-4xl md:text-5xl lg:text-[62px]">
                sentir{' '}
                <em className="italic text-accent">tú</em>
              </span>
            </h1>

            <div className="hidden md:block w-10 h-0.5 bg-accent mb-5" />

            <p className="font-body text-[15px] text-fg-2 max-w-sm leading-[1.75] mb-8">
              Encuentra tu tono perfecto entre nuestra colección artesanal.
              Hecho para todas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/catalogo"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
              >
                Ver colección
                <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/catalogo?orden=nuevo"
                className="relative inline-flex items-center justify-center px-7 py-3.5 text-sm font-body font-medium text-fg-2 hover:text-fg transition-colors duration-150 after:absolute after:bottom-2.5 after:left-7 after:h-px after:w-0 after:bg-accent after:transition-[width] after:duration-200 hover:after:w-[calc(100%-56px)]"
              >
                Ver novedades
              </Link>
            </div>
          </motion.div>

          {/* ── Columna derecha ── */}
          <motion.div
            className="relative h-72 md:h-130 overflow-hidden order-first md:order-last"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            {hasProducts ? (
              <ProductSpotlight products={products} />
            ) : (
              /* Bolitas originales como fallback */
              <>
                {CIRCLES.map((c, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: c.size, height: c.size,
                      top: c.top, left: c.left,
                      backgroundColor: c.color,
                      filter: `blur(${c.blur})`,
                      zIndex: c.z,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                    }}
                    animate={{ y: [0, -c.float, 0] }}
                    transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
                  />
                ))}
              </>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
