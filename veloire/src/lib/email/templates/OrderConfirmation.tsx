import * as React from 'react'

interface Props {
  orderNumber: string
  customerName: string
  total: number
  items: Array<{ productName: string; shadeName: string; quantity: number; unitPrice: number }>
}

export function OrderConfirmation({ orderNumber, customerName, total, items }: Props) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#D4537E' }}>Vèloire</h1>
      <h2>¡Hola {customerName}! Tu pedido fue recibido.</h2>
      <p>Número de pedido: <strong>#{orderNumber}</strong></p>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F8EBE8' }}>
            <th align="left">Producto</th>
            <th align="left">Tono</th>
            <th align="right">Cant.</th>
            <th align="right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F8EBE8' }}>
              <td>{item.productName}</td>
              <td>{item.shadeName}</td>
              <td align="right">{item.quantity}</td>
              <td align="right">${item.unitPrice.toLocaleString('es-CO')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} align="right"><strong>Total:</strong></td>
            <td align="right"><strong>${total.toLocaleString('es-CO')}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style={{ color: '#666', fontSize: 14, marginTop: 24 }}>
        Pronto te contactaremos para confirmar el pago. ¡Gracias por tu compra!
      </p>
    </div>
  )
}
