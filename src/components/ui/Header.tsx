'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ShoppingBag, Search, User, Sun, Moon, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Novedades', href: '/catalogo?orden=nuevo' },
  { label: 'Sobre nosotras', href: '/nosotras' },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Cambiar tema"
      className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
    >
      <Moon size={17} className="dark:hidden" />
      <Sun size={17} className="hidden dark:block" />
    </button>
  )
}

function isNavActive(href: string, pathname: string): boolean {
  const [path] = href.split('?')
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(path + '/')
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const openDrawer = useCartStore((s) => s.openDrawer)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 bg-alt ${
          scrolled ? 'border-b border-rim' : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Hamburguesa — solo móvil */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl text-fg uppercase tracking-[0.12em] md:mr-8 flex-1 md:flex-none text-center md:text-left"
          >
            Vèloire
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7 flex-1">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(link.href, pathname)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-body transition-colors duration-150 ${
                    active
                      ? 'text-fg after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-px after:bg-accent'
                      : 'text-accent hover:text-fg'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-0.5">
            <button
              aria-label="Buscar"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
            >
              <Search size={17} />
            </button>
            <Link
              href="/cuenta"
              aria-label="Mi cuenta"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
            >
              <User size={17} />
            </Link>
            <button
              onClick={openDrawer}
              aria-label="Abrir carrito"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
            >
              <ShoppingBag size={17} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 left-0 h-full w-72 bg-alt z-50 flex flex-col md:hidden border-r border-rim"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-rim">
                <Link
                  href="/"
                  className="font-display text-2xl text-fg uppercase tracking-[0.12em]"
                  onClick={() => setMenuOpen(false)}
                >
                  Vèloire
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-fg-2 hover:text-fg transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col px-4 py-6 gap-1">
                {NAV_LINKS.map((link) => {
                  const active = isNavActive(link.href, pathname)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`px-3 py-3 rounded-lg text-sm font-body transition-colors ${
                        active
                          ? 'text-fg bg-black/5 dark:bg-white/5 font-medium'
                          : 'text-accent hover:text-fg hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto border-t border-rim px-4 py-4 flex items-center gap-3">
                <Link
                  href="/cuenta"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-body text-fg-2 hover:text-fg transition-colors"
                >
                  <User size={16} />
                  Mi cuenta
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
