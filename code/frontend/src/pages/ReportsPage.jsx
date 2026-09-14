import PagePlaceholder from '../components/PagePlaceholder'

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="รายงาน"
      owner="Kanyawee"
      functions={['F-35 สรุปยอดขาย', 'F-36 สินค้าขายดี', 'F-37 ยอดขายตามแคชเชียร์', 'F-38 ยอดขายตามช่องทางชำระเงิน']}
      endpoints={['GET /api/v1/reports/sales-summary?from=&to=', 'GET /api/v1/reports/top-products?from=&to=&limit=', 'GET /api/v1/reports/sales-by-cashier?from=&to=', 'GET /api/v1/reports/sales-by-payment-method?from=&to=']}
    />
  )
}
