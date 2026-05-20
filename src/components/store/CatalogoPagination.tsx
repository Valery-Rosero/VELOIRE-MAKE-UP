'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CatalogoPaginationProps {
  currentPage: number
  totalPages: number
  categoria?: string
  orden?: string
}

export function CatalogoPagination({
  currentPage,
  totalPages,
  categoria,
  orden,
}: CatalogoPaginationProps) {
  const router = useRouter()

  function buildUrl(page: number) {
    const params = new URLSearchParams()
    if (categoria)   params.set('categoria', categoria)
    if (orden)       params.set('orden', orden)
    if (page > 1)    params.set('pagina', String(page))
    const qs = params.toString()
    return `/catalogo${qs ? `?${qs}` : ''}`
  }

  function goToPage(page: number) {
    document.getElementById('catalogo-top')?.scrollIntoView({ behavior: 'smooth' })
    router.push(buildUrl(page))
  }

  // Mostrar máx. 5 páginas alrededor de la actual
  const pageButtons: number[] = []
  const radius = 2
  for (
    let i = Math.max(1, currentPage - radius);
    i <= Math.min(totalPages, currentPage + radius);
    i++
  ) {
    pageButtons.push(i)
  }

  const btnBase =
    'w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-body transition-colors duration-150'
  const btnInactive = 'border-rim text-fg-2 hover:border-rim-2 hover:text-fg'
  const btnActive   = 'bg-accent border-accent text-white'
  const btnDisabled = 'border-rim text-fg-3 opacity-30 cursor-not-allowed'

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-1.5 mt-12"
    >
      {/* Anterior */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Primera página + ellipsis */}
      {pageButtons[0] > 1 && (
        <>
          <button onClick={() => goToPage(1)} className={`${btnBase} ${btnInactive}`}>1</button>
          {pageButtons[0] > 2 && (
            <span className="w-9 h-9 flex items-center justify-center text-fg-3 text-sm">…</span>
          )}
        </>
      )}

      {/* Páginas centrales */}
      {pageButtons.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
        >
          {p}
        </button>
      ))}

      {/* Ellipsis + última página */}
      {pageButtons[pageButtons.length - 1] < totalPages && (
        <>
          {pageButtons[pageButtons.length - 1] < totalPages - 1 && (
            <span className="w-9 h-9 flex items-center justify-center text-fg-3 text-sm">…</span>
          )}
          <button onClick={() => goToPage(totalPages)} className={`${btnBase} ${btnInactive}`}>
            {totalPages}
          </button>
        </>
      )}

      {/* Siguiente */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
