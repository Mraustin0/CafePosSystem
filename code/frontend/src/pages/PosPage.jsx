import PagePlaceholder from '../components/PagePlaceholder'

export default function PosPage() {
  return (
    <PagePlaceholder
      title="หน้าขาย"
      owner="Kawinthida"
      functions={['F-24 ดูเมนูสำหรับขาย (แยกตามหมวด)', 'F-25 สร้างออเดอร์จากตะกร้า', 'F-26 แก้ไขรายการในออเดอร์', 'F-28 ใช้ส่วนลด (ไม่มี / % / จำนวนเงิน)']}
      endpoints={['GET /api/v1/categories', 'GET /api/v1/products?active=true&size=100', 'POST /api/v1/orders', 'PUT /api/v1/orders/{id}/items', 'PUT /api/v1/orders/{id}/discount']}
    />
  )
}
