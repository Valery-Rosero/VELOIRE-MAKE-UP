'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-body text-fg-2">¿Cerrar sesión?</span>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="text-sm font-body text-error hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Sí, salir'}
        </button>
        <span className="text-fg-3 text-sm">·</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-sm font-body text-fg-2 hover:text-fg transition-colors"
    >
      <LogOut size={15} />
      Cerrar sesión
    </button>
  )
}
