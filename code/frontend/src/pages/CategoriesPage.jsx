import PagePlaceholder from '../components/PagePlaceholder'

export default function CategoriesPage() {
  return (
    <PagePlaceholder
      title="จัดการหมวดหมู่"
      owner="Thana-nan"
      functions={['F-10 ดูหมวดหมู่ทั้งหมด', 'F-11 เพิ่มหมวดหมู่', 'F-12 แก้ไขหมวดหมู่', 'F-13 ลบหมวดหมู่ (มีสินค้าอยู่ → 409)']}
      endpoints={['GET /api/v1/categories  ✅ พร้อมใช้ — src/api/categories.js', 'POST /api/v1/categories  ✅', 'PUT /api/v1/categories/{id}  ✅', 'DELETE /api/v1/categories/{id}  ✅']}
    />
  )
}
