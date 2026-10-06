# Payment Integration — Bug Tickets

เอกสาร audit ระหว่าง Backend Payment API และ Frontend PaymentModal/PaymentSuccessModal (หลัง port งานจาก Thana-nan PR #27 + #28). พบปัญหา contract mismatch, edge cases และ hardcoded data ที่ต้องแก้

**Backend Contract Summary:**
- `POST /api/v1/orders/{id}/payment` body: `{ method: 'CASH'|'QR_CODE'|'CARD', amountReceived: BigDecimal }`
- `CASH`: `amountReceived >= order.total` (backend คำนวณ change)
- `QR_CODE / CARD`: `amountReceived == order.total EXACTLY` → 400 ถ้าไม่ตรง
- Order ต้องเป็น `PENDING` → 409 ถ้า PAID/CANCELLED
- Backend `order.total = subtotal - discount` (subtotal จาก DB prices ณ ขณะ createOrder)

---

## 🎫 P01 — [Blocker] Total mismatch เมื่อมี promotion (QR/CARD จะ 400)

- **Type:** Bug (Contract Mismatch)
- **Priority:** Blocker
- **Files:** `PaymentModal.jsx`, `PosScreen.jsx`

### Problem
`PaymentModal.totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0)` คำนวณจาก **cart raw subtotal** ไม่หัก promo discount

Backend `order.getTotal() = subtotal - discount` (หลัง applyDiscount)

เมื่อ user เลือก promo → กด Payments → PaymentModal ส่ง `amountReceived = totalAmount` (ก่อนหัก) → backend เช็ค `QR_CODE/CARD: received == total exactly` → **400 Bad Request**

CASH: ผ่านเพราะ `>= total` แต่ user จ่ายเกิน (backend คำนวณ change จาก over-payment)

### Fix
Pass `total` (subtotal - promoDiscount) เป็น prop เข้า PaymentModal แทนคำนวณจาก cart, และ handleConfirmPayment ใช้ค่านี้เป็น amountReceived สำหรับ QR

---

## 🎫 P02 — [Blocker] PaymentModal ไม่แสดง promotion discount

- **Type:** Bug (UX)
- **Priority:** Blocker
- **Files:** `PaymentModal.jsx`

### Problem
PaymentModal แสดง "ส่วนลดพิเศษ (Promotion) -฿0.00" hardcoded ไม่รับ `appliedPromo`

User เห็นยอดชำระเต็ม แต่ backend รับยอดหัก promo → cashier รับเงินเกิน

### Fix
- Pass `appliedPromo` + `promoDiscount` เข้า PaymentModal
- แสดง discount + total ที่ถูก
- `totalAmount` display = `subtotal - discount`

---

## 🎫 P03 — [High] CARD payment method ไม่มีใน UI

- **Type:** Feature Gap
- **Priority:** High
- **Files:** `PaymentModal.jsx`

### Problem
Backend enum `PaymentMethod { CASH, QR_CODE, CARD }` แต่ PaymentModal มีแค่ `cash` + `promptpay` — ไม่มี CARD button

### Fix
เพิ่มปุ่ม "บัตรเครดิต / Card" เข้าใน method-grid, mapping `card` → `CARD`

หรือถ้า Thana-nan intentionally exclude → ลบ CARD ออกจาก backend enum

---

## 🎫 P04 — [High] Order/payment ไม่ atomic — race + duplicate orders

- **Type:** Bug (Data Integrity)
- **Priority:** High
- **Files:** `PosScreen.jsx` (handleConfirmPayment)

### Problem
Flow ปัจจุบัน:
```
createOrder → applyDiscount → payOrder
```
ถ้า `payOrder` fail (เช่น 400 amount mismatch) → order ค้างสถานะ PENDING ใน DB. User กด Retry → เรียก `createOrder` ใหม่ → **duplicate order + duplicate items**

### Fix
Cache orderId หลัง createOrder สำเร็จ. ถ้า payment fail → เก็บ orderId + retry เฉพาะ `payOrder` (ไม่สร้าง order ใหม่). Reset orderId cache หลัง success หรือ user cancel

หรือใช้ backend endpoint atomic ที่ยิงครั้งเดียว (ถ้ามี)

---

## 🎫 P05 — [Medium] Payment method mapping fragile

- **Type:** Code Quality
- **Priority:** Medium
- **Files:** `PosScreen.jsx` (handleConfirmPayment)

### Problem
```js
const method = paymentData.method === "promptpay" ? "QR_CODE" : "CASH";
```
Fallback → CASH สำหรับทุก method อื่น. ถ้า P03 เพิ่ม `card` → mapping จะ default เป็น CASH ผิด

### Fix
Explicit map object:
```js
const METHOD_MAP = { cash: "CASH", promptpay: "QR_CODE", card: "CARD" };
const method = METHOD_MAP[paymentData.method];
if (!method) throw new Error(`Unknown method: ${paymentData.method}`);
```

---

## 🎫 P06 — [Medium] PaymentSuccessModal ใช้ client-side change แทน backend response

- **Type:** Bug (Data Consistency)
- **Priority:** Medium
- **Files:** `PaymentSuccessModal.jsx`, `PosScreen.jsx`

### Problem
Backend คำนวณ `change = amountReceived - total` และ round HALF_UP ที่ 2 decimals ส่งกลับใน `PaymentResponse.change`

Frontend ใช้ `paymentData.changeAmount = Math.max(0, cashGiven - totalAmount)` (client-side, ไม่มี rounding rule เดียวกัน) แสดงใน receipt

Edge case: JavaScript float precision (`0.1 + 0.2 = 0.30000000000000004`) → client แสดง `฿0.30` แต่ backend เก็บ `฿0.30` (จริง ๆ ตรงกัน กรณีนี้ แต่บาง scenario ผิด)

### Fix
PaymentSuccessModal ใช้ `paymentData.payment.change` (จาก backend response) แทน `changeAmount`. Fallback client-side ถ้า backend ไม่ส่ง (offline mode)

---

## 🎫 P07 — [Low] orderId hardcoded fallback ใน PaymentSuccessModal

- **Type:** Bug
- **Priority:** Low
- **Files:** `PaymentSuccessModal.jsx`

### Problem
```jsx
const { ..., orderId = 'A-108', ... } = paymentData || {};
```
Fallback `'A-108'` จะแสดงถ้า `paymentData.orderId` undefined. `handleConfirmPayment` ส่ง `paymentData` ที่มี `order` (object) แต่ไม่มี `orderId` (string). PaymentSuccessModal ก็แสดง `A-108` เสมอ

### Fix
`setCompletedPaymentData({ ...paymentData, orderId: order.orderNumber, cart, order, payment })`

---

## 🎫 P08 — [Low] VAT display ไม่ตรงกับ backend

- **Type:** UX Confusion
- **Priority:** Low
- **Files:** `PaymentModal.jsx`

### Problem
PaymentModal แสดง `VAT 7% (รวมในราคาแล้ว) ฿{(totalAmount * 7 / 107)}` — hardcoded display

Backend ไม่มี VAT logic ใน Order/Payment entity. Display นี้ misleading เพราะ receipt ไม่มี VAT breakdown จริง

### Fix
Option A: ลบ VAT line ออก (ตรงกับ backend)
Option B: เพิ่ม VAT logic ใน backend + expose ใน PaymentResponse
Option C: Confirm กับ Thana-nan ว่าต้องการ display อย่างเดียว → เก็บไว้แต่หมายเหตุใน UI ว่า "estimated"

---

## 🎫 P09 — [Medium] cashierName hardcoded

- **Type:** Bug (Personalization)
- **Priority:** Medium
- **Files:** `PaymentSuccessModal.jsx`, `PosScreen.jsx`

### Problem
```jsx
cashierName = 'แคชเชียร์ 01'
```
Default fallback. `handleConfirmPayment` ไม่ส่ง cashierName → receipt แสดงชื่อผิดเสมอ

### Fix
`setCompletedPaymentData({ ..., cashierName: user?.username ?? user?.email ?? 'Cashier' })` (dip ค่าจาก `useAuth()`)

---

## 🎫 P10 — [Low] amountReceived scale/precision

- **Type:** Edge Case
- **Priority:** Low
- **Files:** `PosScreen.jsx` (handleConfirmPayment)

### Problem
Backend `validateAmount` ทำ `received.setScale(2, HALF_UP)` แล้ว compare กับ total (ที่ set scale 2 ไว้แล้ว)

Frontend ส่ง `Number(paymentData.cashGiven)` — JS Number ไม่มี fixed scale. ถ้ามี float precision error (rare) อาจส่ง `100.00000000001` → backend round ← ยัง OK

แต่ถ้า user พิมพ์ `"100.005"` → `Number = 100.005` → JSON `100.005` → backend `HALF_UP` = `100.01` — user ตั้งใจจ่าย `100.005` (ไม่มีในความจริง แต่ contract ไม่ชัด)

### Fix
Frontend `.toFixed(2)` ก่อนส่ง เพื่อ match backend scale exactly:
```js
const amountReceived = (method === "CASH" ? paymentData.cashGiven : paymentData.totalAmount).toFixed(2);
```

---

## Execution Order

**Priority 1 (Blockers — POS ใช้ไม่ได้เมื่อมี promo):**
- P01 (total mismatch) + P02 (promo display) — แก้พร้อมกัน

**Priority 2 (High — data integrity):**
- P04 (atomic order/payment) — ป้องกัน duplicate orders
- P03 (add CARD support หรือ remove จาก backend)
- P05 (method mapping) — ทำก่อน P03

**Priority 3 (Polish):**
- P06 (backend change value)
- P09 (cashier name)
- P07 (orderNumber)
- P08 (VAT decision)
- P10 (amount scale)
