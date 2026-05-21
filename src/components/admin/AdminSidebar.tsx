'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, BarChart2, Settings, X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, exact: false },
  { href: '/admin/productos', label: 'Productos', icon: Package, exact: false },
  { href: '/admin/inventario', label: 'Inventario', icon: BarChart2, exact: false },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings, exact: false },
]

interface Props {
  userEmail: string
  userName: string | null
  onClose?: () => void
}

export function AdminSidebar({ userEmail, userName, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-alt border-r border-rim flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-rim flex items-start justify-between">
        <div>
          <span className="font-display text-xl text-accent block leading-none">Vèloire</span>
          <span className="font-body text-[11px] text-fg-3 uppercase tracking-widest mt-0.5 block">
            Admin
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-fg-3 hover:text-fg transition-colors mt-0.5"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors border-l-[3px] ${
                isActive
                  ? 'bg-rose-light text-rose font-medium border-rose'
                  : 'text-fg-2 hover:bg-highlight hover:text-fg border-transparent'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User info + sign-out */}
      <div className="border-t border-rim px-4 py-4">
        <p className="font-body text-xs font-medium text-fg truncate">{userName ?? 'Administradora'}</p>
        <p className="font-body text-xs text-fg-3 truncate mb-3">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs font-body text-fg-2 hover:text-fg transition-colors"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
