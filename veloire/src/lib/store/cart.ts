import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  shadeId: string
  productName: string
  shadeName: string
  shadeHex: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (shadeId: string) => void
  updateQuantity: (shadeId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item) {
        set((state) => {
          const existing = state.items.find((i) => i.shadeId === item.shadeId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.shadeId === item.shadeId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem(shadeId) {
        set((state) => ({ items: state.items.filter((i) => i.shadeId !== shadeId) }))
      },

      updateQuantity(shadeId, quantity) {
        if (quantity < 1) return
        set((state) => ({
          items: state.items.map((i) => (i.shadeId === shadeId ? { ...i, quantity } : i)),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      total() {
        return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      },
    }),
    { name: 'veloire-cart' }
  )
)
