'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength, getPasswordStrength } from '@/components/auth/PasswordStrength'

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      router.replace('/recuperar-contrasena')
      return
    }
    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) {
        router.replace('/recuperar-contrasena')
      } else {
        setReady(true)
      }
    })
  }, [searchParams, router])

  const passwordWeak = password.length > 0 && getPasswordStrength(password) < 2
  const mismatch = confirmTouched && confirm !== password

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setConfirmTouched(true)
    if (password.length < 8 || getPasswordStrength(password) < 2) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.')
      return
    }
    if (confirm !== password) return
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[26px] text-fg leading-snug mb-1.5">
          Nueva contraseña
        </h1>
        <p className="font-body text-sm text-fg-2">Elige una contraseña segura para tu cuenta.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <PasswordInput
            name="password"
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            error={passwordWeak ? 'Contraseña demasiado débil.' : undefined}
            disabled={loading}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          name="confirm"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setConfirmTouched(true)}
          error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
          disabled={loading}
        />

        {error && (
          <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar contraseña'
          )}
        </button>
      </form>
    </div>
  )
}
