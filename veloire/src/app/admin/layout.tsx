export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="font-display text-xl text-rose mb-8">Vèloire Admin</h2>
        <nav className="space-y-2 text-sm">
          <a href="/admin" className="block px-3 py-2 rounded-lg hover:bg-rose-light">Dashboard</a>
          <a href="/admin/productos" className="block px-3 py-2 rounded-lg hover:bg-rose-light">Productos</a>
          <a href="/admin/pedidos" className="block px-3 py-2 rounded-lg hover:bg-rose-light">Pedidos</a>
          <a href="/admin/inventario" className="block px-3 py-2 rounded-lg hover:bg-rose-light">Inventario</a>
          <a href="/admin/configuracion" className="block px-3 py-2 rounded-lg hover:bg-rose-light">Configuración</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
