'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

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

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function buildUrl(categoria: string | null, orden: string | null) {
    const params = new URLSearchParams()
    if (categoria) params.set('categoria', categoria)
    if (orden)    params.set('orden', orden)
    const qs = params.toString()
    return `/catalogo${qs ? `?${qs}` : ''}`
  }

  function setCategory(slug: string | null) {
    router.push(buildUrl(slug, activeOrder ?? null))
  }

  function setOrder(value: string) {
    router.push(buildUrl(activeCategory ?? null, value || null))
    setDropdownOpen(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Pills de categoría */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 flex-1 scrollbar-none">
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

      {/* Sort dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-body font-medium bg-card border border-rim text-fg-2 hover:border-rim-2 transition-colors whitespace-nowrap"
        >
          <span>{activeSortLabel}</span>
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
