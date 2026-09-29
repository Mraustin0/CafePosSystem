# Backend Integration Audit

Audit backend API endpoints vs frontend usage หลัง port งานทั้งหมดจาก Thana-nan

Backend มี **51 endpoints** ใน 9 controllers (`/api/v1/*`). Frontend มี wrapper functions ครบทุก endpoint แต่ **UI จริงเรียกใช้แค่ subset** — เหลือ features ที่ยังไม่มี UI

---

## ✅ Endpoints ที่ Wired เรียบร้อยใน UI

| Endpoint | UI Consumer |
|----------|-------------|
| `POST /auth/login` | LoginPage |
| `GET /products` | PosScreen, MenuManagementView |
| `POST /products` | AddNewItemModal |
| `PUT /products/{id}` | MenuConfigModal (name + price + addOnIds) |
| `PATCH /products/{id}/status` | MenuManagementView (soft delete + toggle) |
| `GET /categories` | PosScreen (load once for `NAV_TO_CATEGORY` mapping) |
| `GET /add-ons` | PosScreen, AddonManagementView |
| `POST /add-ons` | AddonManagementView |
| `PATCH /add-ons/{id}/status` | AddonManagementView |
| `GET /promotions` | PromotionView, SelectPromotionModal |
| `POST /promotions` | AddPromotionModal |
| `PUT /promotions/{id}` | AddPromotionModal (edit) |
| `PATCH /promotions/{id}/status` | PromotionView |
| `DELETE /promotions/{id}` | PromotionView |
| `POST /orders` | PosScreen (handleConfirmPayment) |
| `PUT /orders/{id}/discount` | PosScreen (applyDiscount ใน checkout) |
| `POST /orders/{orderId}/payment` | PosScreen (handleConfirmPayment) |

**Total wired: 17/51 endpoints**

---

## 🎫 Backend Endpoints ที่ยังไม่มี UI (34 endpoints)

## 🟠 High Priority (Business-critical missing features)

### B01 — Dashboard / Reports (4 endpoints ไม่ใช้)
- `GET /reports/sales-summary`
- `GET /reports/top-products`
- `GET /reports/sales-by-cashier`
- `GET /reports/sales-by-payment-method`

**Impact:** PosScreen มี nav "Dashboard" แต่กดแล้วไม่มี view. Owner/manager ไม่สามารถดูยอดขายรายวัน/สินค้าขายดี/ยอดตามพนักงาน/ยอดตามวิธีจ่าย

**Fix:** สร้าง `DashboardView.jsx` แสดง 4 metrics พร้อม date-range filter → wire `activeNav === "dashboard"` ใน PosScreen

---

### B02 — Order History / Bill Management (4 endpoints ไม่ใช้)
- `GET /orders` (list with filters: status, date, cashier)
- `GET /orders/{id}` (detail)
- `PUT /orders/{id}/items` (edit before payment)
- `POST /orders/{id}/cancel`

**Impact:** POS สร้าง order แต่ไม่มีทางดู history หรือ cancel ที่ค้าง PENDING (bug จาก P04). ไม่สามารถแก้ order ก่อนจ่าย

**Fix:** สร้าง `BillManagementView.jsx` (Kawinthida branch ทำอยู่แล้ว! commit `ffcb407` — ต้อง port มา wire) → เพิ่ม nav "บิล/Bills" ใน PosScreen sidebar

---

### B03 — User Management (7 endpoints ไม่ใช้)
- `GET /users` (admin list)
- `GET /users/{id}`
- `POST /users` (create cashier/admin)
- `PUT /users/{id}` (edit role/info)
- `PATCH /users/{id}/status` (activate/deactivate)
- `PUT /users/me/profile`
- `PUT /users/me/password`

**Impact:** ADMIN ไม่สามารถเพิ่ม/แก้ cashier ใหม่ผ่าน UI. Cashier แก้รหัสตัวเองไม่ได้

**Fix:** สร้าง `UserManagementView` + `ProfileSettingsView` — เพิ่ม nav "จัดการผู้ใช้" (admin only) และ "โปรไฟล์" ใน sidebar

---

### B04 — Payment Receipt Lookup (1 endpoint ไม่ใช้)
- `GET /orders/{orderId}/payment`

**Impact:** Cashier reprint receipt ของ order เก่าไม่ได้. ต้อง cache client-side หรือดูจาก history

**Fix:** ใน BillManagementView (B02) — คลิก order ที่ PAID → เรียก `getPayment` → เปิด PaymentSuccessModal อีกครั้ง

---

## 🟡 Medium Priority (Nice-to-have / QoL)

### B05 — Category CRUD (4 endpoints ไม่ใช้)
- `GET /categories/{id}`, `POST /categories`, `PUT /categories/{id}`, `DELETE /categories/{id}`

**Impact:** Owner ไม่สามารถเพิ่มหมวดหมู่ใหม่ (นอกจาก Coffee/Tea/Bakery ที่ seed). ต้องแก้ DB ตรงๆ

**Fix:** เพิ่ม admin UI ใน MenuManagementView หรือแยก `CategoryManagementView`

**Note:** Frontend hard-code `CATEGORY_TO_NAV = { Coffee, Tea, Bakery }` — ถ้าเพิ่มหมวดใหม่ต้อง update mapping ด้วย (ควรเป็น dynamic จาก backend)

---

### B06 — AddOn Detail + Edit (2 endpoints ไม่ใช้)
- `GET /add-ons/{id}`
- `PUT /add-ons/{id}` (แก้ชื่อ + ราคา)

**Impact:** สร้าง add-on ได้ แต่แก้ทีหลังไม่ได้ (แค่ toggle active) — ถ้าตั้งราคาผิดต้องสร้างใหม่

**Fix:** เพิ่ม edit button ใน AddonManagementView row

---

### B07 — Get Me / Session Refresh (1 endpoint ไม่ใช้)
- `GET /users/me`

**Impact:** Session data (`user`) มาจาก login response แล้วเก็บใน localStorage. ถ้า admin แก้ role หลัง login → user ยังเห็น role เก่าจนกว่าจะ logout+login

**Fix:** เรียก `getMe()` ตอน AuthProvider mount + on window focus (ถ้า token ยังไม่หมดอายุ)

---

## 🟢 Low Priority

### B08 — Order Items Replace (1 endpoint — dup กับ B02)
- `PUT /orders/{id}/items` — รวมใน B02

### B09 — Payment Fetch Optional (dup กับ B04)

---

## ✅ Search Wiring Fixes (แก้แล้ว)

### S01 — PosScreen main menu search
- **Before:** `<input>` static, พิมพ์ไม่มีผล
- **After:** wire `menuSearch` state → filter `item.name` case-insensitive
- **Type:** Client-side (filter loaded menu). Backend has `search` param on `GET /products` ที่ไม่ใช้ — client filter เพียงพอสำหรับ 200-item cache

### S02 — MenuManagementView search
- **Before:** `<input>` static
- **After:** wire `search` state → filter ร่วมกับ `categoryFilter`

### S03 — PromotionView search + status filter
- **Before:** search input ไม่มี placeholder, filter select ไม่ wired
- **After:** wire `search` (title + code) + `statusFilter` (ALL/ACTIVE/INACTIVE). เพิ่ม `<option value="ALL">` (เดิมมีแค่ ACTIVE/INACTIVE เลยเห็นแต่ ACTIVE)

---

## Execution Priority

**Sprint 1 — Business-critical:**
1. B01 Dashboard (4 endpoints) — owner ต้องดูยอด
2. B02 Order History (4 endpoints) — port Kawinthida BillManagementView
3. B04 Payment reprint — dependency ของ B02

**Sprint 2 — Admin ops:**
4. B03 User Management (7 endpoints)
5. B05 Category CRUD

**Sprint 3 — Polish:**
6. B06 AddOn edit
7. B07 getMe session refresh
