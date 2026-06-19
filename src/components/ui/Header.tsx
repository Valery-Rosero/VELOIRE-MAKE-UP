'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ui/ThemeProvider'
import { ShoppingBag, Search, User, Sun, Moon, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Catálogo',       href: '/catalogo' },
  { label: 'Novedades',      href: '/catalogo?orden=nuevo' },
  { label: 'Sobre nosotras', href: '/nosotras' },
  { label: 'Contacto',       href: '/contacto' },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Cambiar tema"
      className="w-11 h-11 flex items-center justify-center text-fg-2 hover:text-fg transition-colors duration-150"
    >
      <Moon size={16} className="dark:hidden" />
      <Sun size={16} className="hidden dark:block" />
    </button>
  )
}

function isNavActive(href: string, pathname: string): boolean {
  const [path] = href.split('?')
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(path + '/')
}

function AccentStripe() {
  return (
    <div
      aria-hidden
      style={{
        height: '2px',
        background:
          'linear-gradient(90deg, transparent 0%, #8B2252 8%, #ed4a89 28%, #a56583 52%, #c08fa2 72%, transparent 100%)',
      }}
    />
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const openDrawer = useCartStore((s) => s.openDrawer)
  const prevCountRef = useRef(itemCount)
  const [badgeAnim, setBadgeAnim] = useState(0)

  useEffect(() => {
    if (itemCount > prevCountRef.current) setBadgeAnim((k) => k + 1)
    prevCountRef.current = itemCount
  }, [itemCount])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const badge = (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.span
          key={badgeAnim}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.4, 1] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3, times: [0, 0.6, 1] }}
          className="absolute -top-0.5 -right-0.5 bg-rose-vivid text-white flex items-center justify-center rounded-full font-body font-medium pointer-events-none"
          style={{ width: '15px', height: '15px', fontSize: '9px' }}
        >
          {itemCount}
        </motion.span>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-alt transition-all duration-200 ${
          scrolled ? 'border-b border-[#e8d0c0] dark:border-rim shadow-[0_1px_8px_rgba(0,0,0,0.06)]' : ''
        }`}
      >
        <AccentStripe />

        {/* ── Fila principal: logo + íconos ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/*
            Un solo div con h-16 en móvil y py-4 en desktop.
            Los hijos usan md:hidden / hidden md:flex para alternar.
          */}
          <div className="relative flex items-center h-16 md:h-auto md:py-4">

            {/* Hamburguesa — solo móvil */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="md:hidden w-11 h-11 flex items-center justify-center text-fg-2 hover:text-fg transition-colors shrink-0"
            >
              <Menu size={22} />
            </button>

            {/* Logo móvil — centrado absolutamente */}
            <Link
              href="/"
              className="md:hidden absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none"
            >
              <span
                className="font-display italic text-fg leading-none uppercase"
                style={{ fontSize: '26px', letterSpacing: '1px' }}
              >
                Vèloire
              </span>
              <span
                className="font-body uppercase leading-none mt-0.75"
                style={{ fontSize: '7px', letterSpacing: '4px', color: '#a56583' }}
              >
                MAKE UP
              </span>
            </Link>

            {/* Logo desktop — alineado a la izquierda */}
            <Link
              href="/"
              className="hidden md:flex flex-col items-start leading-none"
            >
              <span
                className="font-display italic text-fg leading-none uppercase"
                style={{ fontSize: '36px', letterSpacing: '1px' }}
              >
                Vèloire
              </span>
              <span
                className="font-body uppercase leading-none mt-0.75"
                style={{ fontSize: '8px', letterSpacing: '4px', color: '#a56583' }}
              >
                MAKE UP
              </span>
            </Link>

            {/* Íconos — lado derecho */}
            <div className="ml-auto flex items-center gap-0.5">
              {/* Solo desktop */}
              <button
                aria-label="Buscar"
                className="hidden md:flex w-9 h-9 items-center justify-center text-fg-2 hover:text-fg transition-colors duration-150"
              >
                <Search size={16} />
              </button>
              <Link
                href="/cuenta"
                aria-label="Mi cuenta"
                className="hidden md:flex w-9 h-9 items-center justify-center text-fg-2 hover:text-fg transition-colors duration-150"
              >
                <User size={16} />
              </Link>

              {/* Carrito — ambos */}
              <button
                onClick={openDrawer}
                aria-label="Abrir carrito"
                className="relative w-11 h-11 md:w-9 md:h-9 flex items-center justify-center text-fg-2 hover:text-fg transition-colors duration-150"
              >
                <ShoppingBag size={18} className="md:hidden" />
                <ShoppingBag size={16} className="hidden md:block" />
                {badge}
              </button>

              {/* Tema — ambos */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ── Separador + nav (solo desktop) ── */}
        <div className="hidden md:block border-t border-[#e8d0c0] dark:border-rim" />
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center gap-10 h-10">
              {NAV_LINKS.map((link) => {
                const active = isNavActive(link.href, pathname)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-body transition-colors duration-150 ${
                      active
                        ? 'text-fg border-b-2 border-fg pb-0.5'
                        : 'text-fg-2 hover:text-fg'
                    }`}
                    style={{ fontSize: '11px', letterSpacing: '2px' }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Drawer móvil ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel — full width desde arriba */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 left-0 right-0 w-full z-50 bg-alt"
            >
              <AccentStripe />

              {/* Encabezado del drawer */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d0c0] dark:border-rim/40">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-start leading-none"
                >
                  <span
                    className="font-display italic text-fg leading-none uppercase"
                    style={{ fontSize: '30px', letterSpacing: '1px' }}
                  >
                    Vèloire
                  </span>
                  <span
                    className="font-body uppercase leading-none mt-0.75"
                    style={{ fontSize: '7px', letterSpacing: '4px', color: '#a56583' }}
                  >
                    MAKE UP
                  </span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="w-11 h-11 flex items-center justify-center text-fg-2 hover:text-fg transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Links con separadores — centrados */}
              <nav className="w-full flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`w-full flex items-center justify-center h-14 border-b border-[#e8d0c0] dark:border-rim/30 font-display italic text-[22px] transition-colors duration-150 ${
                      isNavActive(link.href, pathname) ? 'text-accent' : 'text-fg hover:text-accent'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Pie del drawer */}
              <div className="flex justify-center py-4">
                <Link
                  href="/cuenta"
                  onClick={() => setMenuOpen(false)}
                  className="h-11 flex items-center gap-2 text-sm font-body text-fg-2 hover:text-fg transition-colors"
                >
                  <User size={15} />
                  Mi cuenta
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
