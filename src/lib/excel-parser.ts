import * as XLSX from 'xlsx'
import type { WizardProduct, WizardShade } from '@/lib/store/supplier-order'

export const REQUIRED_COLS = {
  marca: ['marca', 'brand'],
  nombre: ['nombre', 'name', 'producto', 'product'],
  descripcion: ['descripcion', 'description', 'desc'],
  referencias: ['referencias', 'referencia', 'ref', 'reference', 'codigo', 'code'],
  cantidad_por_referencia: ['cantidad_por_referencia', 'cantidad', 'units', 'unidades', 'stock'],
  total_individual_mayor_con_impuestos: [
    'total_individual_mayor_con_impuestos',
    'precio_unitario',
    'costo_unitario',
    'precio_mayor',
    'precio',
    'unit_price',
    'precio_individual',
  ],
} as const

export type ColKey = keyof typeof REQUIRED_COLS

export function normalizeHeader(s: string): string {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

export function detectColumns(headers: string[]): Partial<Record<ColKey, string>> {
  const normalizedHeaders = headers.map((h) => ({ original: h, normalized: normalizeHeader(h) }))
  const result: Partial<Record<ColKey, string>> = {}

  for (const [key, aliases] of Object.entries(REQUIRED_COLS) as [ColKey, readonly string[]][]) {
    const match = normalizedHeaders.find((h) =>
      aliases.some((alias) => h.normalized === alias || h.normalized.includes(alias))
    )
    if (match) result[key] = match.original
  }

  return result
}

export function buildProducts(
  rows: Record<string, unknown>[],
  colMap: Record<ColKey, string>
): WizardProduct[] {
  const grouped = new Map<string, { product: Omit<WizardProduct, 'shades'>; shades: WizardShade[] }>()

  // Carry-forward state: celdas combinadas en Excel solo tienen valor en la
  // primera fila del grupo; las filas siguientes quedan vacías en SheetJS.
  let lastNombre = ''
  let lastMarca = ''
  let lastDescripcion = ''
  let lastCosto = 0
  let counter = 0

  for (const row of rows) {
    const rawNombre = String(row[colMap.nombre] ?? '').trim()
    const nombre = rawNombre || lastNombre
    if (!nombre) continue
    if (rawNombre) lastNombre = rawNombre

    const rawMarca = String(row[colMap.marca] ?? '').trim()
    const marca = rawMarca || lastMarca
    if (rawMarca) lastMarca = rawMarca

    const rawDesc = String(row[colMap.descripcion] ?? '').trim()
    const descripcion = rawDesc || lastDescripcion
    if (rawDesc) lastDescripcion = rawDesc

    const rawCosto = Number(row[colMap.total_individual_mayor_con_impuestos] ?? 0)
    const costo = rawCosto > 0 ? rawCosto : lastCosto
    if (rawCosto > 0) lastCosto = rawCosto

    const ref = String(row[colMap.referencias] ?? '').trim()
    const rawStock = Number(row[colMap.cantidad_por_referencia] ?? 1)
    const stock = isNaN(rawStock) ? 1 : Math.max(0, Math.floor(rawStock))

    if (!grouped.has(nombre)) {
      grouped.set(nombre, {
        product: {
          id: `p-${counter++}-${Math.random().toString(36).slice(2, 8)}`,
          marca,
          nombre,
          descripcion,
          costoUnitario: costo,
          precioVenta: '',
          categoryId: '',
          isFeatured: false,
          mainImageUrl: '',
          noColorVariation: false,
          publishStatus: 'draft',
        },
        shades: [],
      })
    }

    const entry = grouped.get(nombre)!
    if (marca) entry.product.marca = marca
    if (descripcion) entry.product.descripcion = descripcion
    if (costo > 0) entry.product.costoUnitario = costo

    if (ref) {
      entry.shades.push({
        id: `s-${counter++}-${Math.random().toString(36).slice(2, 8)}`,
        excelRef: ref,
        name: ref,
        hexColor: '#C8C8C8',
        imageUrl: '',
        stock,
      })
    }
  }

  return [...grouped.values()].map((e) => ({ ...e.product, shades: e.shades }))
}

export async function parseExcelToRows(
  file: File
): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return { rows: [], error: 'Formato no soportado. Usa .xlsx, .xls o .csv' }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { rows: [], error: 'El archivo supera el límite de 10MB' }
  }

  try {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

    if (rows.length === 0) {
      return { rows: [], error: 'El archivo está vacío o no tiene filas de datos.' }
    }

    return { rows }
  } catch {
    return { rows: [], error: 'No se pudo leer el archivo. Asegúrate de que sea un Excel válido.' }
  }
}
