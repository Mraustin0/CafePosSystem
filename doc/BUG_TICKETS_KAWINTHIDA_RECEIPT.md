# Action Tickets — Kawinthida Receipt Printer + ConfirmDeleteModal (รอ PR เข้า develop)

Kawinthida push commit ใหม่ใน branch `Kawinthida_6733803905_04`:
- `9cdeafc` feat: add new order button and print button to receipt modal

**ยังไม่ merge develop** — ต้องรอ PR เข้าก่อนค่อย port ไป `code/frontend/`

**หลักการ:** port UI verbatim, แก้ wiring/backend เท่าที่จำเป็น (ไม่แก้ layout)

---

## สิ่งที่ Kawinthida เพิ่ม/เปลี่ยน (ใน pos-demo)

### ไฟล์ใหม่ 2 ไฟล์

- **`pos-demo/src/ConfirmDeleteModal.jsx`** (96 lines) — Modal ยืนยันลบธีมเดียวกับหน้า Add-on Management
  - Props: `{ title, itemName, description, confirmText, onConfirm, onCancel }`
  - รองรับ Esc key ปิด modal
  - ใช้แทน native `window.confirm` (consistent UX)

- **`pos-demo/src/Receiptprinter.jsx`** (254 lines) — Shared print helper (not a React component — just utility)
  - Export: `printReceipt({ totalAmount, method, cart, orderId, receiptNo, queueNo, cashierName, date, isReprint, onNewOrder })`
  - เปิด new window + render HTML receipt + call `window.print()`
  - รองรับ `isReprint: true` → แสดงป้าย "สำเนา (REPRINT)"
  - รองรับ `onNewOrder` callback → แสดงปุ่ม "เริ่มออเดอร์ใหม่" ในหน้าใบเสร็จ

### ไฟล์แก้ไข 5 ไฟล์

- **`pos-demo/src/PaymentSuccessModal.jsx`** (−258 lines refactor)
  - Import `printReceipt` จาก `./Receiptprinter`
  - `const [now] = useState(() => new Date())` + `[queueNo]` + `[receiptNo]` — เก็บค่าครั้งเดียว ไม่สุ่มใหม่ทุก re-render (fix bug เดิม)
  - ปุ่มพิมพ์ใบเสร็จ → เรียก `printReceipt({ ...paymentData, cashierName, now, queueNo, receiptNo, onNewOrder })`
  - เพิ่ม "เริ่มออเดอร์ใหม่" button

- **`pos-demo/src/BillManagementView.jsx`** (+44 lines)
  - Import `printReceipt` จาก `./Receiptprinter`
  - เพิ่ม helper `billToReceipt(bill)` แปลง bill shape → printReceipt input
  - "พิมพ์ใบเสร็จซ้ำ" button → เรียก `printReceipt(billToReceipt(bill))` with `isReprint: true`

- **`pos-demo/src/PosScreen.jsx`** (600 lines refactor)
  - Import `ConfirmDeleteModal`
  - State: `menuToDelete`
  - MenuManagementView `onDeleteMenu={handleDeleteMenu}` prop → เก็บ item ลง state
  - Render `<ConfirmDeleteModal ... />` เมื่อ `menuToDelete` ไม่ null
  - อาจมี delete flows อื่นด้วย (น่าจะใช้แทน alert/confirm เดิม)

- **`pos-demo/src/AddPromotionModal.jsx`** (28 lines)
  - Small layout tweaks

- **`pos-demo/src/AddNewItemModal.css`** (33 lines)
  - Style refinements

---

## 🎫 R01 — Port `ConfirmDeleteModal.jsx` + `Receiptprinter.jsx` ไป code/frontend

- **Priority:** High
- **Source:** `pos-demo/src/ConfirmDeleteModal.jsx` + `pos-demo/src/Receiptprinter.jsx`
- **Target:**
  - `code/frontend/src/components/PosScreen/ConfirmDeleteModal.jsx`
  - `code/frontend/src/components/PosScreen/Receiptprinter.jsx`

### Acceptance
- Copy both files verbatim (ไม่มี backend wiring — pure UI/utility)
- Verify Esc key handler works
- Verify printReceipt opens new window without pop-up blocker warning

---

## 🎫 R02 — Refactor PaymentSuccessModal รับ Receiptprinter helper

- **Priority:** High
- **Source:** `pos-demo/src/PaymentSuccessModal.jsx` ล่าสุด
- **Target:** `code/frontend/src/components/PosScreen/PaymentSuccessModal.jsx`

### Backend wiring (preserve)
- `paymentData` prop ยังเหมือนเดิม (มี `cart`, `payment`, `order`, etc.)
- `cashierName` prop มาจาก `useAuth().user` (P09 ของผม)
- `onNewOrder` + `onClose` ยังทำงานเหมือนเดิม

### Changes
- Replace inline receipt HTML + handlePrintReceipt → `printReceipt(...)` call
- Add stable `useState(() => new Date())` for timestamp
- Preserve P06 (use `payment.change` from backend) + P07 (use `order.orderNumber`)

---

## 🎫 R03 — BillManagementView reprint button

- **Priority:** Medium
- **Source:** `pos-demo/src/BillManagementView.jsx` ล่าสุด
- **Target:** `code/frontend/src/components/PosScreen/BillManagementView.jsx`

### Backend wiring
- `activeBill` + `activeDetail` state ของผมที่ wire listOrders/getOrder/getPayment ยังอยู่
- `billToReceipt` helper รับ bill shape ปัจจุบัน (summaryToBill output)

### Changes
- Import `printReceipt`
- Replace existing `handleReprint` toast → `printReceipt(billToReceipt(activeBill))`
- Pass `isReprint: true`

### Note
- `billToReceipt` ใน pos-demo อ่าน qty จาก regex `meta.match(/จำนวน:?\s*(\d+)/)` เพราะ mock data ไม่มี field qty
- ของผม `orderToBillItems` ใช้ `activeDetail.items` ตรง ๆ (มี quantity + unitPrice จริง) → ควรใช้ activeDetail แทนถ้า loaded แล้ว

---

## 🎫 R04 — PosScreen ใช้ ConfirmDeleteModal แทน window.confirm

- **Priority:** Medium
- **Source:** `pos-demo/src/PosScreen.jsx` diff
- **Target:** `code/frontend/src/components/PosScreen/PosScreen.jsx`

### Changes
- Import `ConfirmDeleteModal`
- Add `menuToDelete` state
- Pass `onDeleteMenu={setMenuToDelete}` ให้ `MenuManagementView`
- Render `<ConfirmDeleteModal>` conditional block ท้าย JSX
- `onConfirm` → ยิง `setProductStatus(id, false)` (soft-delete) + `loadProducts()`

### Note
- MenuManagementView ของผมปัจจุบันเรียก `setProductStatus` ตรง ๆ (ไม่มี confirm) — ถ้า port R04 ต้องเพิ่ม onDeleteMenu prop + ย้าย logic ไปที่ PosScreen

### Risk
- ต้องเช็คว่า Kawinthida's `MenuManagementView.jsx` (ที่ปรับ 44 lines ก่อนหน้า — commit 8fd99aa) + ล่าสุด (R04) มี `onDeleteMenu` prop ที่ expose หรือยัง

---

## 🎫 R05 — AddPromotionModal + AddNewItemModal.css small tweaks

- **Priority:** Low
- **Files:** 2 files, ~61 lines diff

### Changes
- Sync JSX structure + CSS tokens จาก pos-demo verbatim
- ไม่กระทบ wiring

---

## Execution Order (รอ PR merge ก่อน)

1. ⏸️ **รอ** Kawinthida สร้าง PR develop ← Kawinthida_6733803905_04
2. ⏸️ Merge PR
3. ⏸️ Rebase local develop
4. **R01** port ConfirmDeleteModal + Receiptprinter (standalone, zero dep)
5. **R02** refactor PaymentSuccessModal รับ Receiptprinter
6. **R03** BillManagementView reprint wiring (ใช้ activeDetail items)
7. **R04** PosScreen ConfirmDeleteModal integration (ตรวจ prop interface กับ MenuManagementView)
8. **R05** AddPromotionModal + AddNewItemModal.css sync

---

## Combined with D01-D05 (Kanyawee Dashboard)

ถ้า Kawinthida + Kanyawee PR เข้า develop พร้อมกัน:
- Port Kawinthida ก่อน (standalone utility files) — low risk
- แล้วค่อย port Kanyawee (MainLayout refactor กระทบ PosScreen structure) — high risk
- ตรวจ PosScreen diff ของทั้ง 2 คนไม่ให้ overlap conflict

**หมายเหตุ:** Kawinthida's PosScreen diff (600 lines) + Kanyawee's PosScreen diff (536 lines) น่าจะชนกันตรง sidebar refactor — ต้อง resolve merge conflict ตอน PR 2 ตัวเข้ามา
