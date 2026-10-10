# Action Tickets — Kanyawee Dashboard Refactor (รอ PR เข้า develop)

Kanyawee push งานใหม่ใน branch `Kanyawee_6733805737_04` 2 commits (Oct 2-3):
- `1515764` feat: created Dashboard and sync Sidebar
- `ddcaaa7` Adjust the spacing of the boxes on the Dashboard page

**ยังไม่ merge develop** — ต้องรอ PR เข้าก่อนค่อย port ไป `code/frontend/`

**หลักการ:** port UI verbatim, wire backend ให้แทน mock data, ไม่แก้ layout

---

## สิ่งที่ Kanyawee เพิ่ม/เปลี่ยน (ใน pos-demo)

### ไฟล์ใหม่ 2 ไฟล์
- **`pos-demo/src/DashboardPage.jsx`** (337 lines) — Dashboard หน้าใหม่
  - ใช้ **recharts** library: `AreaChart` (weekly sales trend), `PieChart` (category breakdown)
  - ใช้ **lucide-react**: Clock, TrendingUp, Tag, Calendar, ChevronDown
  - Mock data: `categoryData`, `weeklyData`, `recentOrders`
  - Layout: Header + 4 stat cards + Area/Pie charts + recent orders table
- **`pos-demo/src/MainLayout.jsx`** (111 lines) — Shared layout
  - Sidebar + NAV_ITEMS + NAV_FOOTER (ยกออกจาก PosScreen)
  - `useNavigate` + `useLocation` → ตัวจัดการ activeNav + /dashboard route
  - `<Outlet/>` สำหรับ child route render

### ไฟล์แก้ไข 4 ไฟล์
- **`App.jsx`** — React Router nested routes:
  ```jsx
  <Route path="/" element={<MainLayout ...>}>
    <Route index element={<Navigate to="/pos" replace />} />
    <Route path="pos" element={<PosScreen ...>} />
    <Route path="dashboard" element={<DashboardPage />} />
  </Route>
  ```
- **`PosScreen.jsx`** (536 lines diff) — **ลบ sidebar ออก** ใช้ activeNav/setActiveNav ที่ MainLayout ส่งให้
- **`main.jsx`** — Add BrowserRouter wrapper
- **`package.json`** — Add `recharts` + `lucide-react`

---

## 🎫 D01 — Install dependencies

- **Priority:** Blocker (ไม่ install → build fail)
- **File:** `code/frontend/package.json`

```bash
cd code/frontend && npm install recharts
```
(lucide-react ติดตั้งแล้ว ตอน K03 AddUserPage)

---

## 🎫 D02 — Port MainLayout.jsx จาก pos-demo ไป code/frontend verbatim

- **Priority:** High (จำเป็นก่อน port DashboardPage)
- **Source:** `pos-demo/src/MainLayout.jsx`
- **Target:** `code/frontend/src/components/PosScreen/MainLayout.jsx` (หรือ `pages/MainLayout.jsx`)

### Backend wiring
- ไม่มี backend integration ใน MainLayout (เป็นแค่ layout wrapper)
- ส่ง activeNav / setActiveNav เป็น props ให้ child route

---

## 🎫 D03 — Port DashboardPage.jsx + wire backend reports

- **Priority:** High
- **Source:** `pos-demo/src/DashboardPage.jsx`
- **Target:** `code/frontend/src/pages/DashboardPage.jsx`

### Mock data ที่ต้องแทน
- **`categoryData`** → ไม่มี backend endpoint ตรง ๆ (reports ไม่มี breakdown by category) — อาจคำนวณจาก `topProducts` + group by category ที่ frontend หรือ **ขอ backend เพิ่ม endpoint**
- **`weeklyData`** → ต้องเรียก `salesSummary(from, to)` 7 ครั้ง (วันละครั้ง) หรือ **ขอ backend เพิ่ม endpoint `/reports/sales-by-day`**
- **`recentOrders`** → `listOrders({ size: 10, sort: 'createdAt,desc' })` + map fields
- **Top 4 stat cards:**
  - "ยอดขายวันนี้" → `quickStatsToday().netSales` ✅ (ผมเพิ่งทำ T09!)
  - "ออเดอร์วันนี้" → `quickStatsToday().orderCount` ✅
  - "ยอดเฉลี่ย/ออเดอร์" → `quickStatsToday().avgOrderValue` ✅
  - "ออเดอร์ pending" → `quickStatsToday().pendingCount` ✅

### Acceptance
- Copy JSX + CSS verbatim (ห้ามแก้ Tailwind classes)
- Replace mock arrays with `useState` + `useEffect` + API calls
- Loading state สำหรับระหว่างโหลด
- Error state ถ้า API fail

---

## 🎫 D04 — Refactor App.jsx + PosScreen.jsx รับ MainLayout structure

- **Priority:** High (ก่อน Dashboard เปิดใช้งานได้)
- **Files:** `code/frontend/src/App.jsx`, `code/frontend/src/pages/PosPage.jsx`, `code/frontend/src/components/PosScreen/PosScreen.jsx`

### Current state (ของผม)
- PosScreen มี sidebar ในตัว (NAV_FOOTER รวม "Dashboard" + ลิงก์ไป activeNav==="dashboard")
- /dashboard ไม่ใช่ route แยก — เป็นแค่ view ภายใน PosScreen

### Target (ของ Kanyawee)
- MainLayout มี sidebar
- PosScreen เป็น child route (ไม่มี sidebar แล้ว)
- /dashboard เป็น route แยกที่ render DashboardPage

### Acceptance
- Preserve existing routes (/login, /add-user)
- Preserve RequireAuth guard
- Admin-only "เพิ่มผู้ใช้" nav still accessible
- **ลบ DashboardView.jsx ของผมออก** (ถูก DashboardPage ของ Kanyawee แทนที่)
- **Remove nav "Dashboard" ภายใน PosScreen footer** (ย้ายไป MainLayout แล้ว)

### Risk
- PosScreen activeNav logic เดิมใช้ setActiveNav จาก state ภายใน → ต้องเปลี่ยนรับจาก prop (MainLayout เป็นเจ้าของ state)
- cart state ยังอยู่ใน PosScreen → ต้องไม่หายเวลาสลับไป /dashboard แล้วกลับ (component unmount)
- ถ้า cart state ต้อง persist across routes → ย้ายไป Context หรือ MainLayout

---

## 🎫 D05 — Backend quick-stats expansion (optional)

- **Priority:** Low (nice-to-have สำหรับ Dashboard)
- **File:** `code/backend/src/main/java/com/cafepos/service/impl/ReportServiceImpl.java`

Mock data ที่ Kanyawee ใส่มี 2 ชุดที่ backend ไม่มี endpoint:

**D05a — `/reports/sales-by-day?from=&to=`** → list `{ date, netSales }` รายวันในช่วง (feed `weeklyData`)
**D05b — `/reports/sales-by-category?from=&to=`** → list `{ categoryName, revenue, percent }` (feed `categoryData` pie chart)

### Workaround (ถ้าไม่อยากแก้ backend)
- D05a: client-side loop เรียก `salesSummary` 7 ครั้ง (slow — 7 round-trips)
- D05b: ใช้ `topProducts` + group by category.name ที่ frontend (approximate เท่านั้น — ไม่รวม orders ที่ไม่ในท็อป 10)

---

## Execution Order (รอ merge PR เข้า develop ก่อน)

1. ⏸️ **รอ** Kanyawee สร้าง PR develop ← Kanyawee_6733805737_04
2. ⏸️ Merge PR
3. ⏸️ Rebase local develop
4. **D01** install recharts
5. **D02** port MainLayout
6. **D04** refactor App + PosScreen เอา sidebar ออก
7. **D03** port DashboardPage + wire backend (ลบ DashboardView.jsx เดิม)
8. **D05** (optional) ขอให้ backend เพิ่ม sales-by-day + sales-by-category

---

## Notes

- Kanyawee's Dashboard **ไม่ได้ใช้ React Router นอก MainLayout** — login/add-user ยังเป็น top-level route แยก
- ตรวจดู main.jsx ของ Kanyawee ว่า BrowserRouter ครอบ `<App/>` ตรงไหน
- cart state ที่ควร persist → ให้ MainLayout เป็นเจ้าของ หรือใช้ Context (ตามแต่ Kanyawee design)
- recharts bundle size ~100 KB gzipped — จะทำ bundle โตขึ้น (acceptable สำหรับ dashboard page)
