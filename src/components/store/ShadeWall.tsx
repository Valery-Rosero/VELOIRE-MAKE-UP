'use client'

import { motion } from 'framer-motion'

export interface ShadeWallItem {
  id: string
  name: string
  hex_color: string
  productName: string | null
}

interface ShadeWallProps {
  shades: ShadeWallItem[]
}

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export function ShadeWall({ shades }: ShadeWallProps) {
  if (shades.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-page overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-0.5 h-10 bg-accent mt-1 shrink-0" />
          <div>
            <h2 className="font-display text-2xl md:text-[28px] text-fg leading-tight">
              Encuentra tu tono
            </h2>
          </div>
        </div>
      </div>

      {/* Franja de tonos */}
      <div className="flex h-30">
        {shades.map((shade) => {
          const textColor = isDark(shade.hex_color) ? '#f5e1d3' : '#1a1a1a'

          return (
            <motion.div
              key={shade.id}
              className="relative h-full cursor-pointer overflow-hidden"
              style={{ backgroundColor: shade.hex_color, flexGrow: 1 }}
              whileHover={{ flexGrow: 3 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Nombre del tono — aparece en hover */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center px-2"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <p
                  className="font-display text-[13px] text-center leading-tight truncate w-full"
                  style={{ color: textColor }}
                >
                  {shade.name}
                </p>
                {shade.productName && (
                  <p
                    className="font-body text-[10px] mt-0.5 text-center truncate w-full"
                    style={{ color: textColor, opacity: 0.7 }}
                  >
                    {shade.productName}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
