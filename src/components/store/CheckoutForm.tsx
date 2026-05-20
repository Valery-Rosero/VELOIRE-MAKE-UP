'use client'

import { useState, type FormEvent } from 'react'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function CheckoutForm({ onSubmit }: { onSubmit: (data: CheckoutInput) => Promise<void> }) {
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutInput, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const raw = Object.fromEntries(fd.entries())
    const result = checkoutSchema.safeParse(raw)

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])) as typeof errors)
      return
    }

    setErrors({})
    setGlobalError(null)
    setSubmitting(true)
    try {
      await onSubmit(result.data)
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Error al procesar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="customer_name" label="Nombre completo" error={errors.customer_name} />
      <Input name="customer_email" type="email" label="Correo electrónico" error={errors.customer_email} />
      <Input name="customer_phone" type="tel" label="Teléfono / WhatsApp" error={errors.customer_phone} />
      <Input name="address" label="Dirección" error={errors.address} />
      <div className="grid grid-cols-2 gap-4">
        <Input name="neighborhood" label="Barrio" error={errors.neighborhood} />
        <Input name="city" label="Ciudad" error={errors.city} />
      </div>
      <Input name="department" label="Departamento" error={errors.department} />
      <Input name="notes" label="Notas (opcional)" />

      {/* Método de pago */}
      <div>
        <p className="text-sm font-body font-medium text-fg-2 mb-2">Método de pago</p>
        <div className="flex gap-4 flex-wrap">
          {(['nequi', 'bancolombia', 'efectivo'] as const).map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment_method"
                value={method}
                defaultChecked={method === 'nequi'}
                className="accent-accent w-4 h-4"
              />
              <span className="text-sm font-body text-fg capitalize">{method}</span>
            </label>
          ))}
        </div>
        {errors.payment_method && (
          <p className="text-xs text-error mt-1">{errors.payment_method}</p>
        )}
      </div>

      {globalError && (
        <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg">
          {globalError}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? 'Procesando...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
