function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-xl bg-alt animate-pulse" />
      <div className="space-y-2 px-0.5">
        <div className="h-3.5 rounded-md bg-alt animate-pulse w-3/4" />
        <div className="h-3 rounded-md bg-alt animate-pulse w-1/3" />
        <div className="h-3.5 rounded-md bg-alt animate-pulse w-1/2" />
      </div>
    </div>
  )
}

export default function CatalogoLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Encabezado skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-9 w-56 rounded-lg bg-alt animate-pulse" />
        <div className="h-4 w-24 rounded-md bg-alt animate-pulse" />
      </div>

      {/* Filtros skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {[80, 96, 72, 88, 76, 92].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-alt animate-pulse shrink-0"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="h-8 w-36 rounded-full bg-alt animate-pulse shrink-0" />
      </div>

      <hr className="border-rim my-6" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}
