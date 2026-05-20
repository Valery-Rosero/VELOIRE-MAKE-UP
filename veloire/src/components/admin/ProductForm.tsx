'use client'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ProductInput } from '@/lib/validations/product'

interface ProductFormProps {
  defaultValues?: Partial<ProductInput>
  onSubmit: (data: ProductInput) => Promise<void>
  submitLabel?: string
}

export function ProductForm({ defaultValues, onSubmit, submitLabel = 'Guardar' }: ProductFormProps) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: ProductInput = {
      name: fd.get('name') as string,
      slug: fd.get('slug') as string,
      category_id: fd.get('category_id') as string,
      price: Number(fd.get('price')),
      compare_price: fd.get('compare_price') ? Number(fd.get('compare_price')) : null,
      description: (fd.get('description') as string) || null,
      status: fd.get('status') as ProductInput['status'],
      is_featured: fd.get('is_featured') === 'on',
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <Input name="name" label="Nombre" defaultValue={defaultValues?.name} required />
      <Input name="slug" label="Slug (URL)" defaultValue={defaultValues?.slug} required />
      <Input name="category_id" label="ID de categoría" defaultValue={defaultValues?.category_id} required />
      <div className="grid grid-cols-2 gap-4">
        <Input name="price" label="Precio (COP)" type="number" defaultValue={defaultValues?.price} required />
        <Input name="compare_price" label="Precio anterior (opcional)" type="number" defaultValue={defaultValues?.compare_price ?? undefined} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ''}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Estado</label>
          <select name="status" defaultValue={defaultValues?.status ?? 'draft'} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm mt-5">
          <input type="checkbox" name="is_featured" defaultChecked={defaultValues?.is_featured} className="accent-rose" />
          Destacado
        </label>
      </div>
      <Button type="submit" size="lg">{submitLabel}</Button>
    </form>
  )
}
