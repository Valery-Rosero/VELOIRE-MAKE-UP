import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import type { CartItem } from '@/lib/store/cart'

interface OrderBody extends Record<string, unknown> {
  items: CartItem[]
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderBody = await request.json()
    const { items, ...formData } = body

    // Validar datos del formulario
    const parsed = checkoutSchema.safeParse(formData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const data = parsed.data
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const delivery_fee = 0
    const totalAmount = subtotal + delivery_fee

    const supabase = await createClient()

    // Generar número de pedido
    const { data: orderNumberData, error: rpcError } = await supabase
      .rpc('generate_order_number')
    if (rpcError) throw rpcError

    const orderNumber: string = orderNumberData

    // Crear el pedido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderInsert: any = {
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      address: data.address,
      neighborhood: data.neighborhood,
      city: data.city,
      department: data.department,
      notes: data.notes ?? null,
      payment_method: data.payment_method,
      subtotal,
      delivery_fee,
      total: totalAmount,
      status: 'pending_payment',
    }
    const { data: orderRows, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select('id')

    if (orderError) throw orderError

    const orderId = (orderRows as Array<{ id: string }> | null)?.[0]?.id
    if (!orderId) throw new Error('No se pudo obtener el ID del pedido')

    // Insertar ítems
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      shade_id: item.shadeId,
      product_name: item.productName,
      shade_name: item.shadeName,
      shade_hex: item.shadeHex,
      image_url: item.imageUrl,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(orderItems as any)
    if (itemsError) throw itemsError

    return NextResponse.json({ orderNumber }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
