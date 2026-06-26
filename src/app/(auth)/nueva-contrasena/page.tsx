import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { NuevaContrasenaForm } from './NuevaContrasenaForm'

export default function NuevaContrasenaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      }
    >
      <NuevaContrasenaForm />
    </Suspense>
  )
}
