import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { orderId, type } = body as { orderId?: string; type?: string }

  if (!orderId || !type) {
    return NextResponse.json({ error: 'orderId y type son requeridos.' }, { status: 400 })
  }

  // Email sending would be implemented here (Resend, SendGrid, etc.)
  // For now, log and acknowledge.
  console.log(`[notifications] type=${type} orderId=${orderId}`)

  return NextResponse.json({ success: true })
}
