# Backend Audit — Bug Tickets BE-01..BE-07

User-reported audit findings (Oct 6). รวม 7 tickets คุณภาพดี ครอบคลุม validation gaps, architecture coupling, feature gaps, data integrity, และ security.

---

## 🎫 BE-01 — [Bug/Validation] Promotion ขาด limit % + reject NONE

- **Priority:** High
- **Files:** `PromotionRequest.java`, `PromotionServiceImpl.java`

**Problem:** Admin ตั้ง promotion `PERCENT` > 100% ได้ → บันทึกผ่าน แต่ POS checkout พัง 400. และ `discountType: "NONE"` → 500 DataIntegrityViolationException ที่ DB level

**Fix:** เพิ่ม validation ใน service create/update (หรือ class-level validator ใน DTO)

---

## 🎫 BE-02 — [Architecture] Product-AddOn coupling บล็อก Global Add-ons

- **Priority:** High
- **Files:** `OrderServiceImpl.java` (allowedAddOn, ~L183-189)

**Problem:** `allowedAddOn()` require add-on ต้องผูกกับ product's `product_add_ons` → UI "จัดการท็อปปิ้ง" ที่เพิ่ม global add-ons (ไข่มุก, ช็อตกาแฟ) ลูกค้าสั่งกับเมนูใดก็ได้ ไม่ work. AddNewItemModal ส่ง `addOnIds: []` → เมนูใหม่สั่งพร้อม addon ไม่ได้ (400)

**Fix:** ปรับให้ check เฉพาะ `addOn.isActive()` ไม่บังคับ product association

---

## 🎫 BE-03 — [Feature Gap] Promotion code apply endpoint

- **Priority:** Medium
- **Files:** `OrderController.java`, `OrderService.java`

**Problem:** มีแค่ `PUT /orders/{id}/discount` รับ manual `{type, value}` → Frontend ต้องคำนวณ + check `minOrderAmount` เอง เสี่ยงถูกแทรกแซง

**Fix:** เพิ่ม `PUT /orders/{id}/promotion` body `{ code }` → backend lookup promotion + validate active + check minOrderAmount + apply

---

## 🎫 BE-04 — [Data Integrity] Order ไม่บันทึก promotion id/code

- **Priority:** Medium
- **Files:** `Order.java` + Flyway migration

**Problem:** ตาราง orders มีแค่ `discount_type/value/amount` ไม่รู้ว่าส่วนลดมาจาก promotion ตัวไหน → ไม่สามารถทำรายงาน "โปรโมชั่นใดถูกใช้มากสุด"

**Fix:** เพิ่ม column `promotion_id` (nullable FK → promotions)

---

## 🎫 BE-05 — [API Incompleteness] DELETE สำหรับ Product + Add-on

- **Priority:** Medium
- **Files:** `ProductController.java`, `AddOnController.java`

**Problem:** Category + Promotion มี DELETE แล้ว แต่ Product + Add-on มีแค่ `PATCH /status`. ถ้า admin สร้างผิดก่อนขายจะลบไม่ได้

**Fix:** เพิ่ม `DELETE /products/{id}` + `DELETE /add-ons/{id}` → 409 ถ้ามี history ใน order_items/order_item_add_ons, 204 ถ้ายังไม่ขาย

---

## 🎫 BE-06 — [Code Quality] changePassword ใช้ ResponseStatusException แทน BadRequestException

- **Priority:** Low
- **Files:** `UserServiceImpl.java:59`

**Problem:** โยน `ResponseStatusException` ขณะที่ service อื่นใช้ `BadRequestException` + `GlobalExceptionHandler` → JSON response format ไม่สม่ำเสมอ

**Fix:** `throw new BadRequestException("Current password is incorrect")`

---

## 🎫 BE-07 — [Security] JWT ไม่ re-check active status

- **Priority:** Low/Medium
- **Files:** `SecurityConfig.java`, `AuthServiceImpl.java`

**Problem:** JWT อายุ 8 ชม ไม่ check active status ที่ DB → admin ปิด account แล้ว user คนนั้นยังขายได้จน token หมดอายุ

**Fix:** Custom filter เช็ค user active จาก DB ใน security context + cache (หรือลด token expiry + refresh token)

---

## Execution Order

**Priority 1 (High + easy):**
1. BE-06 — 1-line fix
2. BE-01 — validation addition
3. BE-02 — allowedAddOn refactor
4. BE-05 — DELETE endpoints

**Priority 2 (Medium — needs design):**
5. BE-07 — JWT active check filter
6. BE-03 — promotion code apply
7. BE-04 — schema migration + Order entity change
