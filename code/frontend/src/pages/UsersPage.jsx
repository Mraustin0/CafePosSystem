import PagePlaceholder from '../components/PagePlaceholder'

export default function UsersPage() {
  return (
    <PagePlaceholder
      title="จัดการผู้ใช้"
      owner="Kanyawee"
      functions={['F-06 ดูรายชื่อผู้ใช้', 'F-07 เพิ่มผู้ใช้', 'F-08 แก้ไขผู้ใช้', 'F-09 ระงับ / เปิดใช้งาน']}
      endpoints={['GET /api/v1/users?role=&active=&page=&size=', 'POST /api/v1/users', 'PUT /api/v1/users/{id}', 'PATCH /api/v1/users/{id}/status']}
    />
  )
}
