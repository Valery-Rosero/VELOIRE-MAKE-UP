import * as React from 'react'

interface Props {
  orderNumber: string
  customerName: string
  trackingInfo?: string
}

export function OrderShipped({ orderNumber, customerName, trackingInfo }: Props) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#D4537E' }}>Vèloire</h1>
      <h2>¡Hola {customerName}! Tu pedido está en camino.</h2>
      <p>Pedido <strong>#{orderNumber}</strong> — en tránsito.</p>
      {trackingInfo && (
        <p>Información de rastreo: <strong>{trackingInfo}</strong></p>
      )}
      <p style={{ color: '#666', fontSize: 14 }}>
        Pronto recibirás tu maquillaje. ¡Gracias por elegir Vèloire!
      </p>
    </div>
  )
}
