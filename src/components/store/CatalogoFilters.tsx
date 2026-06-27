'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { buildCatalogoUrl } from '@/lib/catalogo'

interface Category {
  id: string
  name: string
  slug: string
}

interface CatalogoFiltersProps {
  categories: Category[]
  activeCategory?: string
  activeOrder?: string
}

const SORT_OPTIONS = [
  { label: 'Más recientes',       value: '' },
  { label: 'Precio: menor',       value: 'precio-asc' },
  { label: 'Precio: mayor',       value: 'precio-desc' },
  { label: 'Nombre A–Z',          value: 'nombre-az' },
]

export function CatalogoFilters({ categories, activeCategory, activeOrder }: CatalogoFiltersProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === (activeOrder ?? ''))?.label ?? 'Más recientes'

  useClickOutside(dropdownRef, () => setDropdownOpen(false))

  function setCategory(slug: string | null) {
    router.push(buildCatalogoUrl({ categoria: slug, orden: activeOrder }))
  }

  function setOrder(value: string) {
    router.push(buildCatalogoUrl({ categoria: activeCategory, orden: value || null }))
    setDropdownOpen(false)
  }

  return (
    <div className="flex items-center gap-3">
      {/* Pills de categoría — scroll horizontal en móvil */}
      <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 pb-0.5 w-max">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors duration-150 ${
              !activeCategory
                ? 'bg-noir text-beige'
                : 'bg-highlight text-fg-2 hover:bg-noir hover:text-beige'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors duration-150 ${
                activeCategory === cat.slug
                  ? 'bg-noir text-beige'
                  : 'bg-highlight text-fg-2 hover:bg-noir hover:text-beige'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-body font-medium bg-card border border-rim text-fg-2 hover:border-rim-2 transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">{activeSortLabel}</span>
          <span className="sm:hidden">Ordenar</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-52 bg-card border border-rim rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOrder(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm font-body transition-colors ${
                  (activeOrder ?? '') === opt.value
                    ? 'bg-highlight text-accent font-medium'
                    : 'text-fg-2 hover:bg-highlight hover:text-fg'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
