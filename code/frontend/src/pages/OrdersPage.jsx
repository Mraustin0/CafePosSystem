import PagePlaceholder from '../components/PagePlaceholder'

export default function OrdersPage() {
  return (
    <PagePlaceholder
      title="รายการออเดอร์"
      owner="Kanyawee"
      functions={['F-30 ดูรายการออเดอร์ (pagination, กรองสถานะ / วันที่ / แคชเชียร์)']}
      endpoints={['GET /api/v1/orders?status=&from=&to=&cashierId=&page=&size=&sort=']}
    />
  )
}
