export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pedidos hoy</p>
          <p className="text-3xl font-bold mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Ventas del mes</p>
          <p className="text-3xl font-bold mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Productos activos</p>
          <p className="text-3xl font-bold mt-1">—</p>
        </div>
      </div>
    </div>
  )
}
