import Link from 'next/link'
import { Bike, Smartphone, Palette, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { HeroSection } from '@/components/store/HeroSection'
import { CategoryCards } from '@/components/store/CategoryCards'
import { type CarouselProduct } from '@/components/store/NewArrivalsCarousel'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
}

interface FeaturedProduct {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ id: string; is_active: boolean; stock: number }>
  categories: { name: string } | null
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .eq('is_active', true)
      .order('sort_order')
    return data ?? []
  } catch {
    return []
  }
}

async function getNewProducts(): Promise<CarouselProduct[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`
        id, slug, name, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, hex_color, is_active, stock),
        categories(name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)
    const products = (data as unknown as CarouselProduct[]) ?? []
    return products.filter((p) =>
      p.product_shades?.some((s) => s.is_active && s.stock > 0) ?? false
    )
  } catch {
    return []
  }
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`
        id, slug, name, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, is_active, stock),
        categories(name)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as unknown as FeaturedProduct[]) ?? []
  } catch {
    return []
  }
}

// ─── Secciones ────────────────────────────────────────────────────────────────

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-12 border-b border-rim bg-page">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-0.5 h-6 bg-accent shrink-0" />
          <h2 className="font-display text-xl text-fg">Explorar categorías</h2>
        </div>
        <CategoryCards categories={categories} />
      </div>
    </section>
  )
}

function FeaturedSection({ products }: { products: FeaturedProduct[] }) {
  return (
    <section className="py-16 md:py-20 bg-page">
      <div className="max-w-7xl mx-auto px-4">

        {/* Encabezado editorial */}
        <div className="flex items-start justify-between mb-10 md:mb-12">
          <div className="flex items-start gap-4">
            <div className="w-0.5 h-10 bg-accent mt-1 shrink-0" />
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-fg leading-tight">Destacados</h2>
              <p className="font-body text-sm italic text-fg-2 mt-1">Los favoritos de nuestras clientas</p>
            </div>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-body font-medium text-accent hover:text-fg transition-colors duration-150 hidden sm:block mt-1"
          >
            Ver todos →
          </Link>
        </div>

        {/* Grid de productos */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
          <div className="py-20 text-center">
            <p className="font-display text-xl text-fg-2">Próximamente</p>
            <p className="font-body text-sm text-fg-3 mt-2">
              Estamos preparando nuestra colección. Vuelve pronto.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center mt-6 px-5 py-2.5 rounded-lg bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
            >
              Ver catálogo
            </Link>
          </div>
        )}

        {/* Ver todos — móvil */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalogo"
            className="text-sm font-body font-medium text-accent hover:underline underline-offset-4"
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </section>
  )
}

const VALUE_ITEMS = [
  {
    icon: Bike,
    title: 'Envíos a Pasto',
    description: 'Entregamos en toda la ciudad con rapidez y cuidado.',
  },
  {
    icon: Smartphone,
    title: 'Pago fácil por Nequi',
    description: 'Transfiere sin salir de casa. Rápido y seguro.',
  },
  {
    icon: Palette,
    title: 'Tonos para todas',
    description: 'Una paleta pensada para cada piel y cada tono.',
  },
  {
    icon: MessageCircle,
    title: 'Atención personalizada',
    description: 'Te ayudamos a encontrar el tono ideal para ti.',
  },
]

function ValueBanner() {
  return (
    <section className="bg-alt border-y border-rim py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-rim">
          {VALUE_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center md:items-start text-center md:text-left gap-2 md:px-8 first:md:pl-0 last:md:pr-0"
            >
              <Icon size={20} className="text-accent shrink-0" />
              <p className="font-body text-sm font-medium text-fg">{title}</p>
              <p className="font-body text-xs text-fg-2 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [categories, newProducts, featuredProducts] = await Promise.all([
    getCategories(),
    getNewProducts(),
    getFeaturedProducts(),
  ])

  return (
    <>
      <HeroSection products={newProducts} />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featuredProducts} />
      <ValueBanner />
    </>
  )
}
