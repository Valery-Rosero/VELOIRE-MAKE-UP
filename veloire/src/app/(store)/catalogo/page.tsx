import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ id: string; is_active: boolean; stock: number }>
  categories: { name: string } | null
}

interface PageProps {
  searchParams: Promise<{ categoria?: string; orden?: string }>
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order')
    return data ?? []
  } catch {
    return []
  }
}

async function getProducts(categoria?: string, orden?: string): Promise<Product[]> {
  try {
    const supabase = await createClient()

    let categoryId: string | null = null
    if (categoria) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categoria)
        .single()
      categoryId = cat?.id ?? null
    }

    let query = supabase
      .from('products')
      .select(`
        id, slug, name, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, is_active, stock),
        categories(name)
      `)
      .eq('status', 'active')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (orden === 'precio-asc') {
      query = query.order('price', { ascending: true })
    } else if (orden === 'precio-desc') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data } = await query
    return (data as Product[]) ?? []
  } catch {
    return []
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: 'Más nuevos', value: '' },
  { label: 'Precio: menor', value: 'precio-asc' },
  { label: 'Precio: mayor', value: 'precio-desc' },
]

export default async function CatalogoPage({ searchParams }: PageProps) {
  const { categoria, orden } = await searchParams
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(categoria, orden),
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl text-fg">Catálogo</h1>
        <p className="font-body text-sm text-fg-2 mt-1">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 flex-1 scrollbar-none">
          <Link
            href="/catalogo"
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors duration-150 ${
              !categoria
                ? 'bg-accent text-white'
                : 'bg-highlight text-rose-dark hover:bg-accent hover:text-white'
            }`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}${orden ? `&orden=${orden}` : ''}`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors duration-150 ${
                categoria === cat.slug
                  ? 'bg-accent text-white'
                  : 'bg-highlight text-rose-dark hover:bg-accent hover:text-white'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Ordenar */}
        <div className="flex gap-1.5 shrink-0">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/catalogo?${categoria ? `categoria=${categoria}&` : ''}orden=${opt.value}`}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-colors duration-150 ${
                (orden ?? '') === opt.value
                  ? 'bg-fg text-card border-fg'
                  : 'bg-card text-fg-2 border-rim hover:border-rim-2'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p, i) => {
            const mainImage = p.product_images?.find((img) => img.is_main) ?? p.product_images?.[0]
            const activeShades = p.product_shades?.filter((s) => s.is_active) ?? []
            const totalStock = activeShades.reduce((sum, s) => sum + (s.stock ?? 0), 0)
            return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                comparePrice={p.compare_price}
                imageUrl={mainImage?.url}
                imageAlt={mainImage?.alt_text}
                categoryName={p.categories?.name}
                shadeCount={activeShades.length}
                totalStock={totalStock}
                index={i}
              />
            )
          })}
        </div>
      ) : (
        <div className="py-32 text-center">
          <p className="font-display text-xl text-fg-2">Sin resultados</p>
          <p className="font-body text-sm text-fg-3 mt-2">
            No hay productos en esta categoría todavía.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center mt-6 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            Ver todo el catálogo
          </Link>
        </div>
      )}
    </main>
  )
}
