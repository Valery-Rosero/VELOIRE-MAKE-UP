'use client'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ShadeInput } from '@/lib/validations/product'

interface ShadeFormProps {
  defaultValues?: Partial<ShadeInput>
  onSubmit: (data: ShadeInput) => Promise<void>
  onCancel?: () => void
}

export function ShadeForm({ defaultValues, onSubmit, onCancel }: ShadeFormProps) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: ShadeInput = {
      name: fd.get('name') as string,
      hex_color: fd.get('hex_color') as string,
      stock: Number(fd.get('stock')),
      is_active: fd.get('is_active') === 'on',
      sort_order: Number(fd.get('sort_order')),
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-xl">
      <div className="grid grid-cols-2 gap-3">
        <Input name="name" label="Nombre del tono" defaultValue={defaultValues?.name} required />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Color</label>
          <input
            type="color"
            name="hex_color"
            defaultValue={defaultValues?.hex_color ?? '#D4537E'}
            className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input name="stock" label="Stock" type="number" min={0} defaultValue={defaultValues?.stock ?? 0} />
        <Input name="sort_order" label="Orden" type="number" min={0} defaultValue={defaultValues?.sort_order ?? 0} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? true} className="accent-rose" />
        Activo
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Guardar tono</Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
