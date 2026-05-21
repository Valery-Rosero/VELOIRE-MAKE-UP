'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AdminSidebar } from './AdminSidebar'
import { AdminMobileHeader } from './AdminMobileHeader'

interface Props {
  children: React.ReactNode
  userEmail: string
  userName: string | null
}

export function AdminLayoutShell({ children, userEmail, userName }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-page">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar userEmail={userEmail} userName={userName} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
            >
              <AdminSidebar
                userEmail={userEmail}
                userName={userName}
                onClose={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden">
          <AdminMobileHeader onMenuClick={() => setDrawerOpen(true)} />
        </div>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
