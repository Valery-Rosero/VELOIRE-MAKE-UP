'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
      className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-accent hover:bg-highlight transition-colors duration-150"
    >
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
    </button>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const openDrawer = useCartStore((s) => s.openDrawer)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-150 ${
          scrolled
            ? 'bg-card border-b border-rim shadow-none'
            : 'bg-card/80 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Hamburguesa — solo móvil, izquierda */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-fg-2 hover:text-accent transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl text-accent tracking-tight md:mr-8 flex-1 md:flex-none text-center md:text-left"
          >
            Vèloire
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-body text-fg-2 hover:text-accent transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1">
            <button aria-label="Buscar" className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-accent hover:bg-highlight transition-colors duration-150">
              <Search size={18} />
            </button>
            <Link href="/cuenta" aria-label="Mi cuenta" className="w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-accent hover:bg-highlight transition-colors duration-150">
              <User size={18} />
            </Link>
            <button
              onClick={openDrawer}
              aria-label="Abrir carrito"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-accent hover:bg-highlight transition-colors duration-150"
            >
              <ShoppingBag size={18} />
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
              className="fixed top-0 left-0 h-full w-72 bg-card z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-rim">
                <Link href="/" className="font-display text-xl text-accent" onClick={() => setMenuOpen(false)}>
                  Vèloire
                </Link>
                <button onClick={() => setMenuOpen(false)} className="text-fg-2 hover:text-fg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col px-4 py-6 gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-3 rounded-lg text-fg-2 hover:text-accent hover:bg-highlight transition-colors text-sm font-body"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
