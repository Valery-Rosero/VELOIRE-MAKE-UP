import Link from 'next/link'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ orderNumber: string }>
}

async function getWhatsapp(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: rows } = await supabase
      .from('store_config')
      .select('value')
      .eq('key', 'whatsapp_number')
      .limit(1)
    return (rows as Array<{ value: string }> | null)?.[0]?.value ?? null
  } catch {
    return null
  }
}

export default async function PedidoPage({ params }: PageProps) {
  const { orderNumber } = await params
  const whatsapp = await getWhatsapp()

  const waMessage = encodeURIComponent(
    `Hola Vèloire 🌸 Acabo de hacer mi pedido #${orderNumber}. ¿Cómo coordino el pago?`
  )
  const waUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${waMessage}`
    : null

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <CheckCircle2 size={56} className="mx-auto text-success mb-5" />

      <h1 className="font-display text-3xl text-fg mb-3">¡Pedido recibido!</h1>

      <p className="font-body text-sm text-fg-2 leading-relaxed mb-2">
        Tu pedido fue registrado con el número:
      </p>
      <p className="font-display text-2xl text-accent mb-6">#{orderNumber}</p>

      <p className="font-body text-sm text-fg-2 leading-relaxed mb-8 max-w-sm mx-auto">
        Nos pondremos en contacto contigo pronto para coordinar el pago y el envío. También puedes escribirnos directamente por WhatsApp.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={16} />
            Escribir por WhatsApp
          </a>
        )}
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-rim text-fg-2 text-sm font-body font-medium hover:border-rim-2 hover:text-fg transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </main>
  )
}
