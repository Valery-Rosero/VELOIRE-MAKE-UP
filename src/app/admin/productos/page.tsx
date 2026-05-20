export default function ProductosAdminPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Productos</h1>
        <a href="/admin/productos/nuevo" className="bg-rose text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-dark transition-colors">
          + Nuevo producto
        </a>
      </div>
    </div>
  )
}
