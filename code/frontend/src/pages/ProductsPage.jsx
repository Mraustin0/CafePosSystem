import PagePlaceholder from '../components/PagePlaceholder'

export default function ProductsPage() {
  return (
    <PagePlaceholder
      title="จัดการสินค้า"
      owner="Thana-nan"
      functions={['F-14 ดูรายการสินค้า (pagination, กรองหมวด, ค้นหา)', 'F-15 ดูรายละเอียดสินค้า', 'F-16 เพิ่มสินค้า', 'F-17 แก้ไขสินค้า', 'F-18 ปิด / เปิดขาย', 'F-19 กำหนด add-on ให้สินค้า']}
      endpoints={['GET /api/v1/products?categoryId=&search=&active=&page=&size=&sort=', 'GET /api/v1/products/{id}', 'POST /api/v1/products', 'PUT /api/v1/products/{id}', 'PATCH /api/v1/products/{id}/status']}
    />
  )
}
