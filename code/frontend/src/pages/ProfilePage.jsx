import PagePlaceholder from '../components/PagePlaceholder'

export default function ProfilePage() {
  return (
    <PagePlaceholder
      title="โปรไฟล์"
      owner="Kanyawee"
      functions={['F-03 ดูโปรไฟล์ตัวเอง', 'F-04 แก้ไขโปรไฟล์', 'F-05 เปลี่ยนรหัสผ่าน']}
      endpoints={['GET /api/v1/users/me', 'PUT /api/v1/users/me/profile', 'PUT /api/v1/users/me/password']}
    />
  )
}
