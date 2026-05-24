'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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

export function HeroSection() {
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
      {/* Mancha decorativa grande — fondo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 680,
          height: 680,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,143,162,0.09) 0%, transparent 70%)',
          right: '-10%',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165,101,131,0.07) 0%, transparent 70%)',
          left: '-6%',
          top: '-8%',
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
            {/* Eyebrow */}
            <p
              className="font-body text-[11px] uppercase text-accent mb-5"
              style={{ letterSpacing: '3px' }}
            >
              Hecho en Pasto, Nariño
            </p>

            {/* Título — 3 líneas intencionadas */}
            <h1 className="font-display leading-[1.08] tracking-tight mb-6">
              <span className="block text-4xl md:text-5xl lg:text-[62px] text-fg">El maquillaje</span>
              <span className="block text-4xl md:text-5xl lg:text-[62px] text-fg">que te hace</span>
              <span className="block text-4xl md:text-5xl lg:text-[62px]">
                sentir{' '}
                <em className="italic text-accent">tú</em>
              </span>
            </h1>

            {/* Separador fino */}
            <div className="hidden md:block w-10 h-0.5 bg-accent mb-5" />

            {/* Subtítulo */}
            <p className="font-body text-[15px] text-fg-2 max-w-sm leading-[1.75] mb-8">
              Encuentra tu tono perfecto entre nuestra colección artesanal.
              Hecho para todas.
            </p>

            {/* Botones */}
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

          {/* ── Columna derecha — círculos flotantes ── */}
          <div className="relative h-64 md:h-[500px] overflow-hidden md:overflow-visible order-first md:order-last">
            {CIRCLES.map((c, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: c.size,
                  height: c.size,
                  top: c.top,
                  left: c.left,
                  backgroundColor: c.color,
                  filter: `blur(${c.blur})`,
                  zIndex: c.z,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                }}
                animate={{ y: [0, -c.float, 0] }}
                transition={{
                  duration: c.dur,
                  repeat: Infinity,
                  delay: c.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
