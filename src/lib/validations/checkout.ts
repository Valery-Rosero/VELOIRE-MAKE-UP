import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customer_email: z.string().email('Correo electrónico inválido'),
  customer_phone: z.string().min(7, 'Teléfono inválido'),
  address: z.string().min(5, 'Dirección requerida'),
  neighborhood: z.string().min(2, 'Barrio requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
  department: z.string().min(2, 'Departamento requerido'),
  notes: z.string().optional(),
  payment_method: z.enum(['nequi', 'bancolombia', 'efectivo']),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
