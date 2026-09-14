import PagePlaceholder from '../components/PagePlaceholder'

export default function ReceiptPage() {
  return (
    <PagePlaceholder
      title="ใบเสร็จ / รายละเอียดออเดอร์"
      owner="Kawinthida"
      functions={['F-31 ดูรายละเอียดออเดอร์ / ใบเสร็จ']}
      endpoints={['GET /api/v1/orders/{id}']}
    />
  )
}
