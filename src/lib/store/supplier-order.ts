import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardShade {
  id: string
  excelRef: string   // original reference from Excel (e.g. "Ref 1")
  name: string       // editable display name
  hexColor: string   // hex color for shade swatch
  imageUrl: string   // empty = no image uploaded
  stock: number
}

export interface WizardProduct {
  id: string
  // From Excel
  marca: string
  nombre: string
  descripcion: string
  costoUnitario: number     // total_individual_mayor_con_impuestos
  shades: WizardShade[]
  // Step 2 — admin fills
  precioVenta: string       // string to allow empty input, parse to float when needed
  categoryId: string
  isFeatured: boolean
  // Step 3
  mainImageUrl: string
  noColorVariation: boolean
  // Step 4
  publishStatus: 'active' | 'draft'
}

export interface Category {
  id: string
  name: string
  slug: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isStep2Complete(p: WizardProduct): boolean {
  const price = parseFloat(p.precioVenta)
  return !!p.categoryId && !isNaN(price) && price > 0
}

export function isStep3Complete(p: WizardProduct): boolean {
  return p.shades.every((s) => s.name.trim().length > 0)
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface SupplierOrderState {
  step: 1 | 2 | 3 | 4
  products: WizardProduct[]
  productIdx: number

  setStep: (s: 1 | 2 | 3 | 4) => void
  setProducts: (ps: WizardProduct[]) => void
  setProductIdx: (i: number) => void
  updateProduct: (id: string, changes: Partial<WizardProduct>) => void
  updateShade: (productId: string, shadeId: string, changes: Partial<WizardShade>) => void
  reset: () => void
}

const initialState = {
  step: 1 as const,
  products: [] as WizardProduct[],
  productIdx: 0,
}

export const useSupplierOrderStore = create<SupplierOrderState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step, productIdx: 0 }),

      setProducts: (products) => set({ products, step: 2, productIdx: 0 }),

      setProductIdx: (productIdx) => set({ productIdx }),

      updateProduct: (id, changes) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        })),

      updateShade: (productId, shadeId, changes) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id !== productId
              ? p
              : {
                  ...p,
                  shades: p.shades.map((s) => (s.id === shadeId ? { ...s, ...changes } : s)),
                }
          ),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'veloire-supplier-order',
      // Only persist the data fields, not the actions
      partialize: (state) => ({
        step: state.step,
        products: state.products,
        productIdx: state.productIdx,
      }),
    }
  )
)
