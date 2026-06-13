import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Tarjeta de métrica secundaria (fila 2 del dashboard)
export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,          // número positivo/negativo para flecha de tendencia
  accent = false,
  iconColor = 'text-fg-3',
}: {
  icon: LucideIcon
  label: string
  value: string | number
  sublabel?: string
  trend?: number
  accent?: boolean
  iconColor?: string
}) {
  const TrendIcon =
    trend === undefined ? null
    : trend > 0 ? TrendingUp
    : trend < 0 ? TrendingDown
    : Minus

  const trendColor =
    trend === undefined ? ''
    : trend > 0 ? 'text-success'
    : trend < 0 ? 'text-error'
    : 'text-fg-3'

  return (
    <div className={`bg-card border rounded-2xl p-4 transition-colors ${accent ? 'border-accent/30 bg-highlight/20' : 'border-rim hover:border-rim-2'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-alt shrink-0`}>
          <Icon size={15} className={iconColor} strokeWidth={1.5} />
        </div>
        {TrendIcon && trend !== undefined && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={12} strokeWidth={2} />
            <span className="font-body text-[11px] font-medium">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <p className={`font-display text-2xl leading-none mb-1 ${accent ? 'text-accent' : 'text-fg'}`}>
        {value}
      </p>
      <p className="font-body text-[11px] text-fg-3">{label}</p>
      {sublabel && (
        <p className="font-body text-[10px] text-fg-3 mt-0.5 italic">{sublabel}</p>
      )}
    </div>
  )
}
