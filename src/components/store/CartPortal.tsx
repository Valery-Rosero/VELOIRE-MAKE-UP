'use client'

import { useCartStore } from '@/lib/store/cart'
import { CartDrawer } from './CartDrawer'

interface CartPortalProps {
  deliveryFee: number
  isLoggedIn: boolean
}

export function CartPortal({ deliveryFee, isLoggedIn }: CartPortalProps) {
  const drawerOpen = useCartStore((s) => s.drawerOpen)
  const closeDrawer = useCartStore((s) => s.closeDrawer)

  return (
    <CartDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      deliveryFee={deliveryFee}
      isLoggedIn={isLoggedIn}
    />
  )
}
