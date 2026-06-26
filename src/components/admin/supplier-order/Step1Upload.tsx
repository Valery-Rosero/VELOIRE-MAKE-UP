'use client'

import { useRef, useState, useCallback } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { useSupplierOrderStore, type WizardProduct } from '@/lib/store/supplier-order'
import {
  REQUIRED_COLS,
  type ColKey,
  detectColumns,
  buildProducts,
  parseExcelToRows,
} from '@/lib/excel-parser'

const COL_LABELS: Record<ColKey, string> = {
  marca: 'Marca del proveedor',
  nombre: 'Nombre del producto',
  descripcion: 'Descripción',
  referencias: 'Referencia / tono',
  cantidad_por_referencia: 'Unidades por referencia',
  total_individual_mayor_con_impuestos: 'Precio unitario al por mayor',
}

// ─── Preview card ─────────────────────────────────────────────────────────────

function ProductPreviewCard({ p }: { p: WizardProduct }) {
  return (
    <div className="bg-alt rounded-xl p-4">
      <p className="font-body text-sm font-medium text-fg truncate">{p.nombre}</p>
      <p className="font-body text-xs text-fg-3 mt-0.5 truncate">{p.marca}</p>
      <div className="flex items-center gap-3 mt-2">
        <span className="font-body text-xs text-fg-2">
          {p.shades.length} tono{p.shades.length !== 1 ? 's' : ''}
        </span>
        {p.costoUnitario > 0 && (
          <span className="font-body text-xs text-fg-2">
            Costo: ${p.costoUnitario.toLocaleString('es-CO')}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Column mapper UI ─────────────────────────────────────────────────────────

function ColumnMapper({
  headers,
  mapping,
  onChange,
}: {
  headers: string[]
  mapping: Partial<Record<ColKey, string>>
  onChange: (key: ColKey, value: string) => void
}) {
  const missing = (Object.keys(REQUIRED_COLS) as ColKey[]).filter((k) => !mapping[k])
  if (missing.length === 0) return null

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mt-4">
      <p className="font-body text-sm font-medium text-warning mb-3">
        No se pudieron detectar todas las columnas automáticamente. Por favor indícalas:
      </p>
      <div className="space-y-3">
        {missing.map((key) => (
          <div key={key}>
            <label className="font-body text-xs text-fg-2 block mb-1">{COL_LABELS[key]}</label>
            <select
              value={mapping[key] ?? ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-rim bg-card font-body text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">— Seleccionar columna —</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step1Upload() {
  const { setProducts } = useSupplierOrderStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [colMap, setColMap] = useState<Partial<Record<ColKey, string>>>({})
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([])
  const [preview, setPreview] = useState<WizardProduct[]>([])

  const hasMissing =
    rawRows.length > 0 &&
    (Object.keys(REQUIRED_COLS) as ColKey[]).some((k) => !colMap[k])

  const parseFile = useCallback(async (file: File) => {
    setParsing(true)
    setError(null)
    setPreview([])

    const { rows, error: parseError } = await parseExcelToRows(file)
    if (parseError) {
      setError(parseError)
      setParsing(false)
      return
    }

    const detectedHeaders = Object.keys(rows[0])
    const detected = detectColumns(detectedHeaders)

    setHeaders(detectedHeaders)
    setColMap(detected)
    setRawRows(rows)

    const allPresent = (Object.keys(REQUIRED_COLS) as ColKey[]).every((k) => detected[k])
    if (allPresent) {
      setPreview(buildProducts(rows, detected as Record<ColKey, string>))
    }

    setParsing(false)
  }, [])

  const handleColMapChange = (key: ColKey, value: string) => {
    const newMap = { ...colMap, [key]: value }
    setColMap(newMap)
    const allPresent = (Object.keys(REQUIRED_COLS) as ColKey[]).every((k) => newMap[k])
    if (allPresent) {
      setPreview(buildProducts(rawRows, newMap as Record<ColKey, string>))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  const reset = () => {
    setHeaders([])
    setColMap({})
    setRawRows([])
    setPreview([])
    setError(null)
  }

  const handleContinue = () => {
    if (preview.length === 0) return
    setProducts(preview)
  }

  if (preview.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm font-medium text-success">
            ✓ Se detectaron {preview.length} producto{preview.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm font-body text-fg-2 hover:text-fg transition-colors"
          >
            <RotateCcw size={14} />
            Cargar otro archivo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 mb-6">
          {preview.map((p) => (
            <ProductPreviewCard key={p.id} p={p} />
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Continuar — completar información
          <ChevronRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet size={28} className="text-accent" />
        </div>
        <h2 className="font-display text-2xl text-fg mb-2">Subir Excel del proveedor</h2>
        <p className="font-body text-sm text-fg-2 max-w-sm mx-auto leading-relaxed">
          Sube el Excel de tu proveedor. El sistema leerá automáticamente los productos y sus referencias.
        </p>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        disabled={parsing}
        className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-rim hover:border-rim-2 hover:bg-alt/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Upload size={32} className={parsing ? 'text-accent animate-bounce' : 'text-fg-3'} />
        <div className="text-center">
          <p className="font-body text-sm font-medium text-fg">
            {parsing ? 'Leyendo archivo...' : 'Arrastra tu Excel aquí o haz clic para seleccionar'}
          </p>
          <p className="font-body text-xs text-fg-3 mt-1">Formatos: .xlsx, .xls, .csv · Máximo 10MB</p>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f) }}
      />

      {/* Columnas esperadas */}
      <div className="mt-6 p-4 bg-card border border-rim rounded-xl">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-3">
          Columnas que debe tener el Excel
        </p>
        <div className="grid grid-cols-2 gap-1">
          {Object.values(COL_LABELS).map((label) => (
            <p key={label} className="font-body text-xs text-fg-2">• {label}</p>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-xl">
          <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
          <p className="font-body text-sm text-error">{error}</p>
        </div>
      )}

      {rawRows.length > 0 && hasMissing && (
        <ColumnMapper headers={headers} mapping={colMap} onChange={handleColMapChange} />
      )}
    </div>
  )
}
