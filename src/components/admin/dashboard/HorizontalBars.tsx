'use client'

// Barras horizontales CSS para top productos, top tonos y días de la semana.
// Sin dependencias externas.

export interface BarItem {
  label: string
  sublabel?: string
  value: number
  formattedValue: string
  color?: string        // hex para swatches (tonos)
  barColor?: string     // CSS color para la barra
}

export function HorizontalBars({
  items,
  emptyMessage = 'Sin datos',
}: {
  items: BarItem[]
  emptyMessage?: string
}) {
  if (items.length === 0) {
    return (
      <p className="font-body text-xs text-fg-3 text-center py-6">{emptyMessage}</p>
    )
  }

  const max = Math.max(...items.map(i => i.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              {item.color && (
                <div
                  className="w-3 h-3 rounded-full shrink-0 border border-rim"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <div className="min-w-0">
                <p className="font-body text-xs font-medium text-fg truncate">{item.label}</p>
                {item.sublabel && (
                  <p className="font-body text-[10px] text-fg-3 truncate">{item.sublabel}</p>
                )}
              </div>
            </div>
            <span className="font-body text-xs font-semibold text-fg shrink-0">
              {item.formattedValue}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-alt overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.barColor ?? 'var(--accent-rose)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
