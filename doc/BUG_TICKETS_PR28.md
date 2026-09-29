# Action Tickets — PR #27 & #28 Integration (Payment Modal + Bug Fixes)

เอกสารสรุปงาน integration หลัง merge PR #27 (`feat(payment): implement full-screen split payment modal and success screen`) และ PR #28 (`feat(payment): add sliding print animation and printer slot to receipt preview`) จาก branch `Thana-nan_6733805868_04` เข้าสู่ `develop`

Thana-nan อัพเดต UI ใหม่ 3 commits ใน `pos-demo/` (source of truth) แต่ยังไม่ได้ port ไป `code/frontend/`. งานที่ต้องทำคือ port UI verbatim + เชื่อม backend + fix bug ที่พบ

**หลักการ:** ห้ามแก้ UI ต้องเหมือน `pos-demo/` เป๊ะๆ. Backend wiring อยู่ใน handler เท่านั้น

---

## 🎫 Ticket-01: [Feature] Port `PaymentModal.jsx` จาก pos-demo ไป code/frontend

- **Type:** Feature (UI Port)
- **Priority:** High
- **Source:** [`pos-demo/src/PaymentModal.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/pos-demo/src/PaymentModal.jsx) (commit `23e47eb`)
- **Target:** `code/frontend/src/components/PosScreen/PaymentModal.jsx`

### Description
Thana-nan สร้าง PaymentModal แบบ full-screen split screen ให้เลือก cash/QR แล้ว confirm payment. Modal ยังไม่มีใน production frontend.

### Acceptance Criteria
- Copy source verbatim จาก `pos-demo/src/PaymentModal.jsx`
- Props: `{ cart, onClose, onConfirmPayment }`
- `onConfirmPayment(data)` ต้องส่ง data ให้ PosScreen จัดการต่อ (คำนวณ total, payment method)
- ห้ามแก้ layout/style ใดๆ

---

## 🎫 Ticket-02: [Feature] Port `PaymentSuccessModal.jsx` จาก pos-demo ไป code/frontend

- **Type:** Feature (UI Port)
- **Priority:** High
- **Source:** [`pos-demo/src/PaymentSuccessModal.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/pos-demo/src/PaymentSuccessModal.jsx) (commits `23e47eb`, `192f954`, `f64bbef`)
- **Target:** `code/frontend/src/components/PosScreen/PaymentSuccessModal.jsx`

### Description
Success screen แสดง thermal receipt + animation + sliding print animation

### Acceptance Criteria
- Copy source verbatim (เอา version ล่าสุด commit `f64bbef`)
- Props: `{ paymentData, onClose, onNewOrder }`
- `paymentData` มี `cart` embedded (Thana-nan patch ใน `f64bbef`)
- ห้ามแก้ layout/style ใดๆ

---

## 🎫 Ticket-03: [Feature] Wire PaymentModal + PaymentSuccessModal เข้า PosScreen + Backend

- **Type:** Feature (Backend Integration)
- **Priority:** High
- **Affected File:** [`code/frontend/src/components/PosScreen/PosScreen.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/PosScreen.jsx)

### Description
เปลี่ยน flow เดิม `handleCheckout` (ยิง API ตอนกดปุ่ม Payments) → flow ใหม่ Thana-nan (เปิด PaymentModal ก่อน → confirm → เรียก backend → เปิด Success)

### Current Flow (Production)
1. User กด `Payments` → เรียก `handleCheckout` → `createOrder` + `payOrder` → alert `ชำระเงินสำเร็จ`
2. Clear cart

### Target Flow (Thana-nan)
1. User กด `Payments` → เปิด `PaymentModal`
2. User เลือก payment method (cash/QR) → กด confirm
3. `onConfirmPayment(data)` → เรียก `createOrder` + `applyDiscount` + `payOrder` → set `completedPaymentData`
4. `PaymentSuccessModal` เปิดอัตโนมัติจาก `completedPaymentData`
5. User กด `New Order` → clear cart + close modal

### Acceptance Criteria
- Import `PaymentModal` + `PaymentSuccessModal`
- Add state: `isPaymentModalOpen`, `completedPaymentData`
- Replace `handleCheckout` call ใน `Payments` button ด้วย `setIsPaymentModalOpen(true)` (เก็บ validation cart.length > 0 ไว้)
- ใน `onConfirmPayment` handler: เรียก backend (`createOrder`, `applyDiscount` ถ้ามี promo, `payOrder`) แล้ว set `completedPaymentData` พร้อม cart
- ใน `onNewOrder`: clear cart, appliedPromo, currentOrder
- Backend error handling: ถ้า backend fail ให้ alert แล้ว **ไม่** เปิด success modal
- ห้ามแก้ Payments button UI ใดๆ

---

## 🎫 Ticket-04: [Style] Sync TeaModal theme สีเขียว → สีส้ม ตาม Thana-nan latest

- **Type:** Style
- **Priority:** Medium
- **Affected File:** [`code/frontend/src/components/PosScreen/TeaModal.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/TeaModal.jsx)
- **Source:** commit `23e47eb` diff

### Description
Thana-nan เปลี่ยนธีม TeaModal จากสีเขียว (#10b981) เป็นสีส้ม (#ea580c) เดียวกับ CoffeeModal ตั้งแต่ commit `23e47eb`. Production ยังใช้สีเขียวอยู่

### Acceptance Criteria
- เปลี่ยนสีทั้งหมดเป็นชุด #ea580c / #fff7ed / #ffedd5 / #c2410c
- Icon addon checkbox: bg เป็น #ea580c
- Selected addon text color: #9a3412 (แทน #047857)
- Base Price color: #ea580c
- ห้ามแก้ structure

---

## 🎫 Ticket-05: [Bug] Addon section หายไปตอนกดเปิด modal (ไม่แสดงเลย)

- **Type:** Bug (Regression)
- **Priority:** High / Blocker
- **Affected Files:**
  - [`code/frontend/src/components/PosScreen/PosScreen.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/PosScreen.jsx) (mapping)
  - [`code/frontend/src/components/PosScreen/CoffeeModal.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/CoffeeModal.jsx) (filter logic)

### Description
เมื่อผู้ใช้กดเลือกเมนู modal เปิดขึ้นมาแต่ไม่แสดง section **ตัวเลือกเพิ่มเติม / ADD-ONS** เลย ทั้งๆ ที่ Thana-nan version แสดงปกติ

### Root Cause Analysis (Hypothesis)
Modal ใช้ filter:
```js
const activeAddons = globalAddons.filter(a =>
  (config.addonIds || []).includes(a.id) && a.isActive
);
```

Production mapping ปัจจุบันใน `PosScreen.jsx`:
```js
config: { addonIds: (p.addOns ?? []).map(a => a.id) },
```

ปัญหาที่เป็นไปได้:
1. Backend response `p.addOns` อาจ empty array (product-addon associations ยังไม่ setup)
2. Type mismatch: `globalAddons[].id` อาจเป็น number แต่ `config.addonIds` อาจเป็น string (หรือกลับกัน)
3. `globalAddons` ยังไม่โหลดเสร็จตอน modal เปิด

### Investigation Steps
1. ดู network response `/products` ว่า `addOns` มีอะไร
2. ดู network response `/addons` ว่า `id` เป็น type อะไร
3. เพิ่ม `console.log` ใน CoffeeModal เพื่อดู `globalAddons`, `config.addonIds`, `activeAddons`
4. เทียบ pos-demo ที่ hardcode addonIds เป็น `['shot', 'whip']` — ต้องเช็คว่าใน production id ตรงกันหรือไม่

### Acceptance Criteria
- Modal แสดง add-on section อย่างน้อย 1 รายการเมื่อ product มี associated addons
- Type-safe id comparison (แปลงเป็น string ทั้งคู่ก่อน compare ถ้าจำเป็น)
- ห้ามแก้ UI ของ modal — แก้แต่ mapping/filter logic

---

## Execution Order

1. **T01** → Port PaymentModal (standalone, no dependency)
2. **T02** → Port PaymentSuccessModal (standalone)
3. **T03** → Wire ทั้งสอง modal เข้า PosScreen + backend
4. **T04** → Fix TeaModal theme (independent)
5. **T05** → Debug & fix addon disappearance (blocker for user experience)

หลังเสร็จทุก ticket: build verify → commit ทีละ ticket → push
