export function buildCatalogoUrl({
  categoria,
  orden,
  pagina,
}: {
  categoria?: string | null
  orden?: string | null
  pagina?: number
}) {
  const params = new URLSearchParams()
  if (categoria) params.set('categoria', categoria)
  if (orden) params.set('orden', orden)
  if (pagina && pagina > 1) params.set('pagina', String(pagina))
  const qs = params.toString()
  return `/catalogo${qs ? `?${qs}` : ''}`
}
