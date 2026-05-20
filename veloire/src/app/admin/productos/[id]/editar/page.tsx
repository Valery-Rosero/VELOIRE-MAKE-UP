export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Editar producto</h1>
      <p className="text-gray-500 text-sm">ID: {id}</p>
    </div>
  )
}
