'use client'

import { useTransition } from 'react'
import { toggleProductStatus } from '@/app/admin/productos/actions'

interface Props {
  productId: string
  currentStatus: 'draft' | 'active' | 'inactive'
}

export function ToggleProductStatus({ productId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleProductStatus(productId, currentStatus)
    })
  }

  const label = currentStatus === 'active' ? 'Desactivar' : 'Activar'

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="text-xs font-body text-fg-2 hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isPending ? '...' : label}
    </button>
  )
}
