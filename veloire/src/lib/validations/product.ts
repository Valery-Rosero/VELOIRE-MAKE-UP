import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  category_id: z.string().uuid('Categoría inválida'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  compare_price: z.number().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
  is_featured: z.boolean().default(false),
})

export const shadeSchema = z.object({
  name: z.string().min(1, 'El nombre del tono es requerido'),
  hex_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
  stock: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
})

export type ProductInput = z.infer<typeof productSchema>
export type ShadeInput = z.infer<typeof shadeSchema>
