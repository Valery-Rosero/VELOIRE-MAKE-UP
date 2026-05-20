import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/store/ProductGallery'
import { ProductActions } from '@/components/store/ProductActions'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ id: string; name: string; hex_color: string; stock: number; is_active: boolean; sort_order: number }>
  categories: { name: string; slug: string } | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, name, hex_color, stock, is_active, sort_order),
        categories(name, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
    return (data as ProductDetail) ?? null
  } catch {
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]
  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  const sortedShades = [...(product.product_shades ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-fg-3 mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link href="/catalogo" className="hover:text-accent transition-colors">Catálogo</Link>
        {product.categories && (
          <>
            <ChevronRight size={12} />
            <Link
              href={`/catalogo?categoria=${product.categories.slug}`}
              className="hover:text-accent transition-colors"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-fg-2 truncate max-w-40">{product.name}</span>
      </nav>

      {/* Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 md:gap-12 lg:gap-16">
        {/* Galería */}
        <div className="w-full">
          <ProductGallery images={product.product_images ?? []} productName={product.name} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Categoría */}
          {product.categories && (
            <Link
              href={`/catalogo?categoria=${product.categories.slug}`}
              className="text-xs font-body font-medium text-accent uppercase tracking-wide hover:underline underline-offset-4 w-fit"
            >
              {product.categories.name}
            </Link>
          )}

          {/* Nombre */}
          <h1 className="font-display text-3xl md:text-4xl text-fg leading-snug">
            {product.name}
          </h1>

          {/* Precio */}
          <div className="flex items-center gap-3">
            <span className="font-body text-2xl font-semibold text-accent-gold">
              ${product.price.toLocaleString('es-CO')}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="font-body text-base text-fg-3 line-through">
                  ${product.compare_price.toLocaleString('es-CO')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gold-light text-gold text-xs font-body font-medium">
                  −{discountPct}%
                </span>
              </>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <p className="font-body text-sm text-fg-2 leading-relaxed">
              {product.description}
            </p>
          )}

          <hr className="border-rim" />

          {/* Selector + CTA */}
          <ProductActions
            productId={product.id}
            productName={product.name}
            price={product.price}
            imageUrl={mainImage?.url ?? null}
            shades={sortedShades}
          />

          {/* Info extra */}
          <div className="mt-2 space-y-1.5">
            <p className="text-xs font-body text-fg-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              Envíos a Pasto · Pago por Nequi o Bancolombia
            </p>
            <p className="text-xs font-body text-fg-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              Atención personalizada por WhatsApp
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
