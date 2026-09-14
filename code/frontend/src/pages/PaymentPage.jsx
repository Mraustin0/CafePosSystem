import PagePlaceholder from '../components/PagePlaceholder'

export default function PaymentPage() {
  return (
    <PagePlaceholder
      title="ชำระเงิน"
      owner="Kawinthida"
      functions={['F-32 รับชำระเงิน (CASH / QR_CODE / CARD)', 'F-33 แสดงเงินทอน', 'F-29 ยกเลิกออเดอร์']}
      endpoints={['GET /api/v1/orders/{id}', 'POST /api/v1/orders/{id}/payment', 'POST /api/v1/orders/{id}/cancel']}
    />
  )
}
