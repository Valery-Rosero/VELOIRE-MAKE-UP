'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ShadeDetail, InventoryRowData } from '@/types/inventory'

interface Props {
  rows: InventoryRowData[]
}

const STATUS_LABELS = { draft: 'Borrador', active: 'Activo', inactive: 'Inactivo' }
const STATUS_COLORS = {
  draft: 'bg-warning/15 text-warning',
  active: 'bg-success/15 text-success',
  inactive: 'bg-error/15 text-error',
}

export function InventoryTable({ rows }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(productId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  return (
    <div className="bg-card border border-rim rounded-2xl overflow-hidden">
      {rows.length === 0 ? (
        <p className="text-center font-body text-sm text-fg-3 py-12">No hay productos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-alt border-b border-rim">
                <th className="text-left px-5 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide w-6" />
                <th className="text-left px-3 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Producto
                </th>
                <th className="text-left px-4 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Categoría
                </th>
                <th className="text-center px-4 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-right px-4 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Tonos
                </th>
                <th className="text-right px-4 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Stock total
                </th>
                <th className="text-right px-4 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Sin stock
                </th>
                <th className="text-right px-5 py-3 font-body text-xs font-medium text-fg-3 uppercase tracking-wide">
                  Stock mín.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rim">
              {rows.map((row) => {
                const isExpanded = expanded.has(row.product_id)
                const rowBg =
                  row.total_stock === 0
                    ? 'bg-error/5'
                    : row.min_shade_stock <= 5
                    ? 'bg-warning/5'
                    : ''

                return (
                  <React.Fragment key={row.product_id}>
                    <tr
                      onClick={() => toggle(row.product_id)}
                      className={`cursor-pointer hover:bg-highlight transition-colors ${rowBg}`}
                    >
                      <td className="px-5 py-3.5 text-fg-3">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="px-3 py-3.5 font-body text-sm text-fg font-medium">
                        {row.product_name}
                      </td>
                      <td className="px-4 py-3.5 font-body text-sm text-fg-2">
                        {row.category_name ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status]}`}
                        >
                          {STATUS_LABELS[row.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-body text-sm text-fg-2 text-right">
                        {row.total_shades}
                      </td>
                      <td className="px-4 py-3.5 font-body text-sm font-medium text-fg text-right">
                        {row.total_stock}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`font-body text-sm font-medium ${
                            row.out_of_stock_shades > 0 ? 'text-error' : 'text-fg-3'
                          }`}
                        >
                          {row.out_of_stock_shades}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-body text-sm text-fg-2 text-right">
                        {row.min_shade_stock}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-8 py-4 bg-alt">
                          <div className="space-y-2 mb-3">
                            {row.shades.length === 0 ? (
                              <p className="font-body text-xs text-fg-3">Sin tonos registrados.</p>
                            ) : (
                              row.shades.map((shade) => (
                                <div key={shade.id} className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded-full shrink-0 border border-rim"
                                    style={{ backgroundColor: shade.hex_color }}
                                  />
                                  <span className="font-body text-sm text-fg flex-1">{shade.name}</span>
                                  {!shade.is_active && (
                                    <span className="font-body text-[10px] text-fg-3 bg-rim px-1.5 py-0.5 rounded">
                                      Inactivo
                                    </span>
                                  )}
                                  {shade.stock === 0 ? (
                                    <span className="font-body text-[10px] font-medium bg-error/15 text-error px-2 py-0.5 rounded-full">
                                      Agotado
                                    </span>
                                  ) : shade.stock <= 5 ? (
                                    <span className="font-body text-[10px] font-medium bg-warning/15 text-warning px-2 py-0.5 rounded-full">
                                      Stock bajo
                                    </span>
                                  ) : null}
                                  <span className="font-body text-sm font-medium text-fg w-12 text-right">
                                    {shade.stock}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                          <Link
                            href={`/admin/productos/${row.product_id}/editar`}
                            className="inline-flex items-center gap-1 font-body text-xs text-accent hover:underline underline-offset-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Editar producto
                          </Link>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
