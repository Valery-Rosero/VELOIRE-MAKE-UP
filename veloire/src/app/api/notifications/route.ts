import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // TODO: enviar notificación por email
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
