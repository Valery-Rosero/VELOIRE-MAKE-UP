'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'

interface ProfileFormProps {
  userId: string
  initialName: string
  initialPhone: string
}

interface FormErrors {
  full_name?: string
  phone?: string
}

function validate(name: string, phone: string): FormErrors {
  const errors: FormErrors = {}
  if (name.trim().length < 2) errors.full_name = 'El nombre debe tener al menos 2 caracteres.'
  if (phone && !/^\d{10}$/.test(phone)) errors.phone = 'El celular debe tener exactamente 10 dígitos.'
  return errors
}

export function ProfileForm({ userId, initialName, initialPhone }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [touched, setTouched] = useState<{ full_name?: boolean; phone?: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const errors = validate(name, phone)
  const visibleErrors: FormErrors = {
    full_name: touched.full_name ? errors.full_name : undefined,
    phone: touched.phone ? errors.phone : undefined,
  }

  const isDirty = name !== initialName || phone !== initialPhone

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.name === 'full_name') setName(e.target.value)
    else setPhone(e.target.value)
    setSaved(false)
    setServerError(null)
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({ full_name: true, phone: true })
    if (Object.keys(errors).length > 0) return
    if (!isDirty) return

    setLoading(true)
    setServerError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq('id', userId)

    if (error) {
      setServerError('No se pudieron guardar los cambios. Inténtalo de nuevo.')
    } else {
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        name="full_name"
        type="text"
        label="Nombre completo"
        placeholder="Tu nombre"
        autoComplete="name"
        value={name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={visibleErrors.full_name}
        disabled={loading}
      />

      <Input
        name="phone"
        type="tel"
        label="Celular"
        placeholder="3001234567"
        autoComplete="tel"
        value={phone}
        onChange={handleChange}
        onBlur={handleBlur}
        error={visibleErrors.phone}
        disabled={loading}
      />

      {serverError && (
        <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-body text-success">
            <Check size={14} />
            Guardado
          </span>
        )}
      </div>
    </form>
  )
}
