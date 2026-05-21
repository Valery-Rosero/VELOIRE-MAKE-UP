'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'

const SECTION_TITLES: Array<{ prefix: string; label: string; exact?: boolean }> = [
  { prefix: '/admin', label: 'Dashboard', exact: true },
  { prefix: '/admin/pedidos', label: 'Pedidos' },
  { prefix: '/admin/productos', label: 'Productos' },
  { prefix: '/admin/inventario', label: 'Inventario' },
  { prefix: '/admin/configuracion', label: 'Configuración' },
]

function getTitle(pathname: string): string {
  const exact = SECTION_TITLES.find((s) => s.exact && s.prefix === pathname)
  if (exact) return exact.label
  const prefix = SECTION_TITLES.find((s) => !s.exact && pathname.startsWith(s.prefix))
  return prefix?.label ?? 'Admin'
}

interface Props {
  onMenuClick: () => void
}

export function AdminMobileHeader({ onMenuClick }: Props) {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-rim px-4 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="p-2 -ml-2 rounded-lg text-fg-2 hover:text-fg hover:bg-highlight transition-colors"
      >
        <Menu size={20} />
      </button>
      <h1 className="font-display text-lg text-fg absolute left-1/2 -translate-x-1/2">
        {getTitle(pathname)}
      </h1>
      <button
        aria-label="Notificaciones"
        className="p-2 -mr-2 rounded-lg text-fg-3 hover:text-fg-2 transition-colors"
      >
        <Bell size={20} />
      </button>
    </header>
  )
}
