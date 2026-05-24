'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Droplets, Eye, Sparkles, Wind, Zap, Minus, type LucideIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; accent: string; icon: LucideIcon }> = {
  labiales:      { bg: '#ed4a89', text: '#ffffff', accent: 'rgba(255,255,255,0.18)', icon: Heart },
  bases:         { bg: '#f5e1d3', text: '#1a1a1a', accent: 'rgba(26,26,26,0.12)',    icon: Droplets },
  sombras:       { bg: '#a56583', text: '#ffffff', accent: 'rgba(255,255,255,0.18)', icon: Eye },
  rubores:       { bg: '#c08fa2', text: '#ffffff', accent: 'rgba(255,255,255,0.18)', icon: Wind },
  iluminadores:  { bg: '#1a1a1a', text: '#f5e1d3', accent: 'rgba(245,225,211,0.15)', icon: Sparkles },
  fijadores:     { bg: '#8B2252', text: '#ffffff', accent: 'rgba(255,255,255,0.18)', icon: Zap },
  cejas:         { bg: '#6b4f5a', text: '#f5e1d3', accent: 'rgba(245,225,211,0.18)', icon: Minus },
}

const FALLBACK_ICONS: LucideIcon[] = [Heart, Droplets, Eye, Wind, Sparkles, Zap, Minus]

const FALLBACK_STYLES = [
  { bg: '#ed4a89', text: '#ffffff', accent: 'rgba(255,255,255,0.18)' },
  { bg: '#c08fa2', text: '#ffffff', accent: 'rgba(255,255,255,0.18)' },
  { bg: '#a56583', text: '#ffffff', accent: 'rgba(255,255,255,0.18)' },
  { bg: '#8B2252', text: '#ffffff', accent: 'rgba(255,255,255,0.18)' },
  { bg: '#1a1a1a', text: '#f5e1d3', accent: 'rgba(245,225,211,0.15)' },
  { bg: '#6b4f5a', text: '#f5e1d3', accent: 'rgba(245,225,211,0.18)' },
  { bg: '#D4A76A', text: '#1a1a1a', accent: 'rgba(26,26,26,0.12)' },
]

const FALLBACK_NAMES = ['Labiales', 'Bases', 'Sombras', 'Rubores', 'Iluminadores', 'Fijadores', 'Cejas']

export function CategoryCards({ categories }: { categories: Category[] }) {
  const items: Category[] =
    categories.length > 0
      ? categories
      : FALLBACK_NAMES.map((name, i) => ({ id: String(i), name, slug: name.toLowerCase() }))

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
      {items.map((cat, i) => {
        const mapped = CATEGORY_STYLES[cat.slug]
        const style = mapped ?? FALLBACK_STYLES[i % FALLBACK_STYLES.length]
        const Icon: LucideIcon = mapped?.icon ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length]
        return (
          <motion.div
            key={cat.id}
            className="shrink-0 snap-start"
            whileHover={{ scale: 1.04, y: -3 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Link
              href={`/catalogo?categoria=${cat.slug}`}
              className="flex flex-col items-center justify-end w-[130px] h-[170px] rounded-2xl relative overflow-hidden"
              style={{ backgroundColor: style.bg }}
            >
              {/* Círculo decorativo de fondo */}
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full"
                style={{ backgroundColor: style.accent }}
              />
              {/* Ícono centrado */}
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center"
              >
                <Icon size={28} style={{ color: style.text, opacity: 0.92 }} strokeWidth={1.5} />
              </div>
              {/* Círculo pequeño decorativo */}
              <div
                className="absolute top-14 right-3 w-4 h-4 rounded-full"
                style={{ backgroundColor: style.accent }}
              />
              {/* Nombre */}
              <div className="relative z-10 px-3 pb-5 pt-2 text-center">
                <p
                  className="font-display text-[16px] leading-tight"
                  style={{ color: style.text }}
                >
                  {cat.name}
                </p>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
