import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // TODO: actualizar estado del pedido
  return NextResponse.json({ message: 'Not implemented', id }, { status: 501 })
}
