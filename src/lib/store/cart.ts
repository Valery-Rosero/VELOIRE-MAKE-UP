import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckoutFormData } from '@/lib/validations/checkout'

export interface CartItem {
  productId: string
  shadeId: string
  productName: string
  shadeName: string
  shadeHex: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  stock: number
}

interface CartStore {
  items: CartItem[]
  drawerOpen: boolean
  checkoutData: CheckoutFormData | null

  addItem: (item: CartItem) => void
  removeItem: (shadeId: string) => void
  updateQuantity: (shadeId: string, quantity: number) => void
  clearCart: () => void
  total: () => number

  openDrawer: () => void
  closeDrawer: () => void

  setCheckoutData: (data: CheckoutFormData) => void
  clearCheckoutData: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      checkoutData: null,

      addItem(item) {
        set((state) => {
          const existing = state.items.find((i) => i.shadeId === item.shadeId)
          if (existing) {
            const newQty = Math.min(existing.quantity + item.quantity, item.stock)
            return {
              items: state.items.map((i) =>
                i.shadeId === item.shadeId
                  ? { ...i, quantity: newQty, stock: item.stock }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(item.quantity, item.stock) }],
          }
        })
      },

      removeItem(shadeId) {
        set((state) => ({ items: state.items.filter((i) => i.shadeId !== shadeId) }))
      },

      updateQuantity(shadeId, quantity) {
        if (quantity < 1) return
        set((state) => ({
          items: state.items.map((i) => {
            if (i.shadeId !== shadeId) return i
            const capped = Math.min(quantity, i.stock ?? Infinity)
            return { ...i, quantity: capped }
          }),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      total() {
        return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      },

      openDrawer() {
        set({ drawerOpen: true })
      },

      closeDrawer() {
        set({ drawerOpen: false })
      },

      setCheckoutData(data) {
        set({ checkoutData: data })
      },

      clearCheckoutData() {
        set({ checkoutData: null })
      },
    }),
    {
      name: 'veloire-cart',
      partialize: (state) => ({
        items: state.items,
        checkoutData: state.checkoutData,
      }),
    }
  )
)
