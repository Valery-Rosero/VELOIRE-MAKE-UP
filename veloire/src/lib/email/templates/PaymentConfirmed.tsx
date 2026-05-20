import * as React from 'react'

interface Props {
  orderNumber: string
  customerName: string
}

export function PaymentConfirmed({ orderNumber, customerName }: Props) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#D4537E' }}>Vèloire</h1>
      <h2>¡Hola {customerName}! Tu pago fue confirmado.</h2>
      <p>Pedido <strong>#{orderNumber}</strong> — estamos preparando tu pedido.</p>
      <p style={{ color: '#B8860B', fontWeight: 'bold' }}>
        Tu orden está siendo preparada y pronto estará en camino.
      </p>
    </div>
  )
}
