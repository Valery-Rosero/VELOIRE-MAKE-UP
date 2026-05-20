import Link from 'next/link'
import { Bike, Smartphone, Palette, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'

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
    return (data as FeaturedProduct[]) ?? []
  } catch {
    return []
  }
}

// ─── Secciones ────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-nude flex items-center">
      <div className="max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-12 items-center">
          {/* Texto */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-[56px] text-fg leading-[1.15] tracking-tight">
              El maquillaje que te hace sentir tú
            </h1>
            <p className="font-body text-base md:text-lg text-fg-2 max-w-md leading-relaxed">
              Encuentra tu tono perfecto entre nuestra colección artesanal. Hecho para todas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity duration-150"
              >
                Ver colección
              </Link>
              <Link
                href="/catalogo?orden=nuevo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-accent text-accent text-sm font-body font-medium hover:bg-rose-light transition-colors duration-150"
              >
                Ver novedades
              </Link>
            </div>
          </div>

          {/* Imagen placeholder */}
          <div className="flex items-center justify-center order-first md:order-last">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-rose-light flex items-center justify-center shadow-inner">
              <span className="font-display text-7xl md:text-8xl text-accent select-none">V</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-10 border-b border-rim">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          <Link
            href="/catalogo"
            className="shrink-0 snap-start px-4 py-2 rounded-full bg-highlight text-rose-dark text-sm font-body font-medium hover:bg-accent hover:text-white transition-colors duration-150 whitespace-nowrap"
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="shrink-0 snap-start px-4 py-2 rounded-full bg-highlight text-rose-dark text-sm font-body font-medium hover:bg-accent hover:text-white transition-colors duration-150 whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          {/* Fallback si no hay categorías de Supabase */}
          {categories.length === 0 && (
            ['Labiales', 'Bases', 'Sombras', 'Rubores', 'Iluminadores', 'Fijadores', 'Cejas'].map((name) => (
              <span
                key={name}
                className="shrink-0 snap-start px-4 py-2 rounded-full bg-highlight text-rose-dark text-sm font-body font-medium whitespace-nowrap"
              >
                {name}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function FeaturedSection({ products }: { products: FeaturedProduct[] }) {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-fg">Destacados</h2>
            <p className="font-body text-sm text-fg-2 mt-1">Los favoritos de nuestras clientas</p>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-body font-medium text-accent hover:underline underline-offset-4 transition-all hidden sm:block"
          >
            Ver todos →
          </Link>
        </div>

        {/* Grid */}
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
              className="inline-flex items-center mt-6 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
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
            <div key={title} className="flex flex-col items-center md:items-start text-center md:text-left gap-2 md:px-8 first:md:pl-0 last:md:pr-0">
              <Icon size={22} className="text-accent shrink-0" />
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
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={products} />
      <ValueBanner />
    </>
  )
}
