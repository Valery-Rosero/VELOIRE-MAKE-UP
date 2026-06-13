'use client'

import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import {
  useSupplierOrderStore,
  isStep2Complete,
  type WizardProduct,
  type Category,
} from '@/lib/store/supplier-order'

// ─── Profit calculator ────────────────────────────────────────────────────────

function ProfitCalc({ product }: { product: WizardProduct }) {
  const price = parseFloat(product.precioVenta) || 0
  const cost = product.costoUnitario
  const qty = product.shades.length || 1

  if (price <= 0 || cost <= 0) return null

  const pct = ((price - cost) / cost) * 100
  const perUnit = price - cost
  const totalProfit = perUnit * qty
  const totalRevenue = price * qty

  const color =
    pct >= 30 ? 'text-success' : pct >= 10 ? 'text-warning' : 'text-error'
  const bg =
    pct >= 30 ? 'bg-success/8 border-success/20' : pct >= 10 ? 'bg-warning/8 border-warning/20' : 'bg-error/8 border-error/20'

  return (
    <div className={`rounded-xl border p-4 ${bg} mt-3`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Rentabilidad</p>
        <span className={`font-display text-2xl font-normal ${color}`}>
          {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-body">
        <div>
          <p className="text-fg-3">Compraste cada uno a</p>
          <p className="font-medium text-fg mt-0.5">${cost.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-fg-3">Lo venderás a</p>
          <p className="font-medium text-fg mt-0.5">${price.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-fg-3">Ganarás por unidad</p>
          <p className={`font-medium mt-0.5 ${color}`}>${perUnit.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-fg-3">Total ingresos (todo el lote)</p>
          <p className="font-medium text-fg mt-0.5">${totalRevenue.toLocaleString('es-CO')}</p>
        </div>
      </div>
      <div className={`mt-3 pt-3 border-t border-current/10 flex justify-between text-xs font-body`}>
        <span className="text-fg-3">Ganancia total del lote ({qty} unidades)</span>
        <span className={`font-semibold ${color}`}>${totalProfit.toLocaleString('es-CO')}</span>
      </div>
      {price < cost && (
        <p className="font-body text-xs text-error mt-2 font-medium">
          ⚠ El precio de venta es menor al costo. Ajústalo antes de publicar.
        </p>
      )}
    </div>
  )
}

// ─── Product form ─────────────────────────────────────────────────────────────

function ProductForm({
  product,
  categories,
}: {
  product: WizardProduct
  categories: Category[]
}) {
  const { updateProduct } = useSupplierOrderStore()
  const id = product.id

  return (
    <div className="space-y-5">
      {/* Header (read-only) */}
      <div className="bg-alt rounded-xl p-4">
        <p className="font-body text-xs text-fg-3 uppercase tracking-wide mb-1">Del Excel</p>
        <p className="font-body text-sm font-medium text-fg">{product.nombre}</p>
        <p className="font-body text-xs text-fg-2 mt-0.5">{product.marca}</p>
        {product.descripcion && (
          <p className="font-body text-xs text-fg-3 mt-1 line-clamp-2">{product.descripcion}</p>
        )}
        <div className="flex gap-4 mt-2 text-xs font-body text-fg-3">
          <span>{product.shades.length} tono{product.shades.length !== 1 ? 's' : ''}</span>
          {product.costoUnitario > 0 && (
            <span>Costo unitario: ${product.costoUnitario.toLocaleString('es-CO')}</span>
          )}
        </div>
      </div>

      {/* Precio de venta */}
      <div>
        <label className="font-body text-sm font-medium text-fg block mb-1.5">
          Precio de venta al público (COP) <span className="text-error">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-body text-sm text-fg-3">$</span>
          <input
            type="number"
            min={0}
            value={product.precioVenta}
            onChange={(e) => updateProduct(id, { precioVenta: e.target.value })}
            placeholder="25000"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-rim bg-card font-body text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <ProfitCalc product={product} />
      </div>

      {/* Categoría */}
      <div>
        <label className="font-body text-sm font-medium text-fg block mb-1.5">
          Categoría <span className="text-error">*</span>
        </label>
        <select
          value={product.categoryId}
          onChange={(e) => updateProduct(id, { categoryId: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-rim bg-card font-body text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          <option value="">— Seleccionar categoría —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Destacado */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={product.isFeatured}
          onChange={(e) => updateProduct(id, { isFeatured: e.target.checked })}
          className="w-4 h-4 accent-accent rounded"
        />
        <div>
          <p className="font-body text-sm font-medium text-fg">Producto destacado</p>
          <p className="font-body text-xs text-fg-3">Aparece en la sección "Destacados" del inicio</p>
        </div>
      </label>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step2Products({ categories }: { categories: Category[] }) {
  const { products, productIdx, setProductIdx, setStep } = useSupplierOrderStore()

  const current = products[productIdx]
  const allDone = products.every(isStep2Complete)
  const total = products.length

  if (!current) return null

  const canGoNext = productIdx < total - 1
  const canGoPrev = productIdx > 0

  return (
    <div className="flex gap-6 max-w-4xl mx-auto">
      {/* ── Sidebar: product list ── */}
      <div className="hidden md:flex flex-col w-52 shrink-0">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-3 px-1">
          Productos ({total})
        </p>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {products.map((p, i) => {
            const done = isStep2Complete(p)
            const active = i === productIdx
            return (
              <button
                key={p.id}
                onClick={() => setProductIdx(i)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-alt text-fg-2 hover:text-fg'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                    done ? 'bg-success border-success' : 'border-rim-2'
                  }`}
                >
                  {done && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
                <span className="font-body text-xs truncate">{p.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main form area ── */}
      <div className="flex-1 min-w-0">
        {/* Mobile progress */}
        <p className="md:hidden font-body text-xs text-fg-3 mb-4">
          Completando producto {productIdx + 1} de {total}
        </p>

        {/* Desktop progress */}
        <div className="hidden md:flex items-center justify-between mb-5">
          <p className="font-body text-sm font-medium text-fg">
            Producto {productIdx + 1} de {total}
          </p>
          {allDone && (
            <span className="font-body text-xs text-success font-medium">✓ Todos completados</span>
          )}
        </div>

        <ProductForm product={current} categories={categories} />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-rim">
          <button
            onClick={() => canGoPrev && setProductIdx(productIdx - 1)}
            disabled={!canGoPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body text-fg-2 hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          {canGoNext ? (
            <button
              onClick={() => setProductIdx(productIdx + 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-rim text-sm font-body font-medium text-fg hover:bg-alt transition-colors"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setStep(3)}
              disabled={!allDone}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar a tonos
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {!allDone && productIdx === total - 1 && (
          <p className="font-body text-xs text-fg-3 text-center mt-2">
            Completa precio y categoría de todos los productos para continuar.
          </p>
        )}
      </div>
    </div>
  )
}
