interface StockAlertProps {
  productName: string
  shadeName?: string
  currentStock: number
  threshold?: number
}

export function StockAlert({ productName, shadeName, currentStock, threshold = 5 }: StockAlertProps) {
  const isOut = currentStock === 0
  return (
    <div className={`flex items-center gap-3 rounded-lg p-3 text-sm ${isOut ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
      <span className="text-lg">{isOut ? '🚫' : '⚠️'}</span>
      <div>
        <p className="font-medium">{productName}{shadeName ? ` — ${shadeName}` : ''}</p>
        <p className="text-xs opacity-75">
          {isOut ? 'Sin stock' : `Stock bajo: ${currentStock} unidades (mínimo recomendado: ${threshold})`}
        </p>
      </div>
    </div>
  )
}
