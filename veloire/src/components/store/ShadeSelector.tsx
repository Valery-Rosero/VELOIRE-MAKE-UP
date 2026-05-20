'use client'

interface Shade {
  id: string
  name: string
  hex_color: string
  stock: number
  is_active: boolean
}

interface ShadeSelectorProps {
  shades: Shade[]
  selectedShadeId: string | null
  onSelect: (shadeId: string) => void
}

export function ShadeSelector({ shades, selectedShadeId, onSelect }: ShadeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {shades.filter(s => s.is_active).map((shade) => {
        const isSelected = shade.id === selectedShadeId
        const isOutOfStock = shade.stock === 0
        return (
          <button
            key={shade.id}
            onClick={() => !isOutOfStock && onSelect(shade.id)}
            disabled={isOutOfStock}
            title={shade.name}
            className={`relative w-9 h-9 rounded-full border-2 transition-all duration-150 ${
              isSelected
                ? 'border-accent scale-110 shadow-md'
                : 'border-transparent hover:border-rim-2'
            } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ backgroundColor: shade.hex_color }}
          >
            {isOutOfStock && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="block w-px h-5 bg-white/80 rotate-45" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
