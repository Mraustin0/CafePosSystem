import PagePlaceholder from '../components/PagePlaceholder'

export default function AddOnsPage() {
  return (
    <PagePlaceholder
      title="จัดการ Add-on"
      owner="Thana-nan"
      functions={['F-20 ดูรายการ add-on', 'F-21 เพิ่ม add-on', 'F-22 แก้ไข add-on', 'F-23 ปิด / เปิดใช้งาน']}
      endpoints={['GET /api/v1/add-ons?active=', 'POST /api/v1/add-ons', 'PUT /api/v1/add-ons/{id}', 'PATCH /api/v1/add-ons/{id}/status']}
    />
  )
}
