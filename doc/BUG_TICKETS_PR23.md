# Bug Report & Action Tickets (Develop Branch - PR #23)

เอกสารสรุปรายงานข้อผิดพลาด (Bug Tickets) ที่พบหลังจาก Merge Pull Request #23 (`feat(pos): wire backend to Thana-nan's UI without changing layout` / Commit `a46ec23`) เข้าสู่ Branch `develop`

---

## 🎫 Ticket-01: [Bug] การ Checkout ออเดอร์ส่งค่า `productId` เป็น Timestamp ทำให้สร้างออเดอร์ไม่สำเร็จ

- **Type:** Bug (Regression / Blocker)
- **Priority:** High / Blocker
- **Affected File:** [`code/frontend/src/components/PosScreen/PosScreen.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/PosScreen.jsx)
- **Component:** POS Screen / Checkout & Order Creation

### Description
เมื่อผู้ใช้กดเลือกสินค้าประเภทเครื่องดื่ม (กาแฟ/ชา) ปรับแต่งผ่าน Modal และเพิ่มลงตะกร้า จากนั้นกดปุ่ม "Payments" เพื่อทำการชำระเงิน ระบบจะส่ง Request ไปยัง API `/orders` เพื่อสร้างออเดอร์ แต่ Payload ในส่วน `items` ระบุ `productId` เป็น Timestamp ขนาดใหญ่ (เช่น `1727520000000`) ส่งผลให้ Backend ตอบกลับเป็น Error 400 / 404 เนื่องจากค้นหา Product ID ดังกล่าวไม่พบ

### Steps to Reproduce
1. เปิดหน้า POS (`/pos`)
2. คลิกเลือกเมนูกาแฟหรือชาเพื่อให้แสดง Modal ปรับแต่ง (`CoffeeModal` หรือ `TeaModal`)
3. ปรับแต่งระดับความหวาน/คั่ว แล้วกด "เพิ่มลงตะกร้า"
4. กดปุ่ม "Payments"
5. ตรวจสอบ Network Request หรือ Console Log จะพบว่า API `POST /api/v1/orders` ได้รับ Payload ที่มี `productId` ผิดเพี้ยน

### Expected Behavior
ระบบควรส่ง `productId` ที่เป็น ID จริงของสินค้านั้นจากฐานข้อมูล (เช่น `1`, `2`, `3`) ไปยัง Backend

### Actual Behavior
- โค้ดส่วนที่เพิ่มสินค้าลงในตะกร้า (`onAddToCart`) ได้ทำการ Overwrite ฟิลด์ `id` ของสินค้าด้วย `Date.now()` เพื่อใช้เป็น Unique Key สำหรับแสดงผลใน React:
  ```javascript
  onAddToCart={(customizedItem) => {
    setCart((prev) => [...prev, { ...customizedItem, id: Date.now() }]);
  }}
  ```
- แต่ในฟังก์ชัน `handleCheckout` มีการดึง `c.id` ซึ่งเป็น Timestamp ไปใช้เป็น `productId`:
  ```javascript
  const byProduct = new Map();
  for (const c of cart) {
    const prev = byProduct.get(c.id) ?? { productId: c.id, quantity: 0, addOnIds: [] };
    prev.quantity += c.qty;
    byProduct.set(c.id, prev);
  }
  const order = await createOrder([...byProduct.values()]);
  ```

### Proposed Fix
1. ให้เก็บรักษา `productId` เดิมไว้ตอนใส่ลงใน `cart`:
   ```javascript
   onAddToCart={(customizedItem) => {
     setCart((prev) => [
       ...prev,
       { ...customizedItem, productId: customizedItem.id, id: Date.now() }
     ]);
   }}
   ```
2. ใน `handleCheckout` ให้ดึงค่าจาก `c.productId` แทน:
   ```javascript
   for (const c of cart) {
     const pId = c.productId ?? c.id;
     const prev = byProduct.get(pId) ?? { productId: pId, quantity: 0, addOnIds: [] };
     prev.quantity += c.qty;
     byProduct.set(pId, prev);
   }
   ```

---

## 🎫 Ticket-02: [Bug] เปิด Modal เพิ่มเมนูใหม่จากแท็บ "จัดการเมนู" (Manage) แล้วบันทึกไม่สำเร็จ (Category Invalid)

- **Type:** Bug
- **Priority:** Medium / High
- **Affected Files:**
  - [`code/frontend/src/components/PosScreen/PosScreen.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/PosScreen.jsx)
  - [`code/frontend/src/components/PosScreen/AddNewItemModal.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/AddNewItemModal.jsx)
- **Component:** Menu Management / Add New Item Modal

### Description
เมื่อผู้ใช้อยู่ในหน้า "จัดการเมนู" (`activeNav === "manage"`) แล้วกดปุ่ม "+ เพิ่มเมนูใหม่" จากนั้นกรอกข้อมูลชื่อเมนูและราคา แล้วกด "บันทึกเมนูใหม่" โดยไม่ได้แตะต้อง Dropdown หมวดหมู่ ระบบจะขึ้นแจ้งเตือนข้อผิดพลาดว่า `ไม่พบหมวด "undefined" ในฐานข้อมูล` ทำให้ไม่สามารถบันทึกเมนูได้

### Steps to Reproduce
1. ไปที่แถบเมนูด้านซ้าย แล้วเลือกแท็บ "จัดการเมนู" (Manage)
2. คลิกการ์ด `+ เพิ่มเมนูใหม่`
3. กรอก "ชื่อเมนูภาษาไทย" และ "ราคาขายปกติ"
4. กดปุ่ม "บันทึกเมนูใหม่" โดยไม่เปลี่ยนค่าใน Dropdown หมวดหมู่

### Expected Behavior
- Modal ควรมีหมวดหมู่ตั้งต้น (Default Category) เป็นหมวดหมู่ที่ใช้งานได้จริง เช่น "กาแฟ (coffee)"
- เมื่อกดบันทึก ข้อมูลเมนูใหม่ต้องถูกส่งไปยัง Backend พร้อม ID หมวดหมู่ที่ถูกต้อง

### Actual Behavior
- `PosScreen.jsx` ส่งค่า `activeCategory={activeNav}` ไปยัง Modal ซึ่งในหน้านี้มีค่าเป็น `"manage"`
- `AddNewItemModal.jsx` นำค่านั้นมาตั้งเป็น State เริ่มต้น:
  ```javascript
  const [selectedCategory, setSelectedCategory] = useState(
    activeCategory === 'all' ? 'coffee' : activeCategory
  );
  ```
  ทำให้ `selectedCategory` มีค่าเป็น `"manage"`
- แม้ว่าใน Dropdown `<select>` จะไม่มีตัวเลือก `"manage"` แต่ค่า State ภายในยังคงเป็น `"manage"`
- เมื่อกดบันทึก `PosScreen.jsx` จะค้นหาจาก Mapping:
  ```javascript
  const backendName = NAV_TO_CATEGORY[form.category]; // NAV_TO_CATEGORY['manage'] -> undefined
  const cat = categories.find((c) => c.name === backendName);
  if (!cat) throw new Error(`ไม่พบหมวด "${backendName}" ในฐานข้อมูล`);
  ```
  ส่งผลให้ Error ทันที

### Proposed Fix
1. ใน `PosScreen.jsx` ให้ส่ง Category ที่ถูกต้องเสมอ:
   ```javascript
   <AddNewItemModal
     activeCategory={NAV_TO_CATEGORY[activeNav] ? activeNav : "coffee"}
     onClose={() => setIsAddMenuOpen(false)}
     ...
   />
   ```
2. ใน `AddNewItemModal.jsx` ป้องกัน State ผิดเพี้ยนด้วย Whitelist Check:
   ```javascript
   const VALID_CATEGORIES = ['coffee', 'tea', 'snack'];
   const [selectedCategory, setSelectedCategory] = useState(
     VALID_CATEGORIES.includes(activeCategory) ? activeCategory : 'coffee'
   );
   ```

---

## 🎫 Ticket-03: [Logic / Incomplete] ส่วนลดโปรโมชั่นไม่ตรวจยอดบิลขั้นต่ำ และไม่ซิงก์ส่วนลดกับ Backend

- **Type:** Business Logic / Incomplete Feature
- **Priority:** Medium
- **Affected Files:**
  - [`code/frontend/src/components/PosScreen/PosScreen.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/PosScreen.jsx)
  - [`code/frontend/src/components/PosScreen/SelectPromotionModal.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/components/PosScreen/SelectPromotionModal.jsx)
- **Component:** Promotion / Discount Calculation & Order Settlement

### Description
1. แคชเชียร์สามารถเลือกใช้โปรโมชั่นที่มีเงื่อนไข "ยอดขั้นต่ำ" ได้ แม้ยอดสั่งซื้อปัจจุบันในตะกร้าจะไม่ถึงยอดขั้นต่ำที่กำหนด
2. ยอดส่วนลดที่คำนวณได้บน UI ไม่ถูกบันทึกเข้าระบบ Backend เพราะถูก Comment ข้ามไว้ ทำให้ยอดรวมฝั่ง Backend เป็นยอดเต็ม ไม่ตรงกับเงินที่แคชเชียร์เก็บจริง

### Steps to Reproduce
1. สั่งกาแฟ 1 แก้ว ยอดเงิน 55 บาท
2. กดปุ่ม "+ เพิ่มส่วนลด"
3. เลือกคูปองที่มีเงื่อนไข "ยอดบิลขั้นต่ำ ฿500 ขึ้นไป" (เช่น SAVE50)
4. สังเกตว่าระบบหักส่วนลดทันที ทั้งที่ยอดบิลไม่ถึง 500 บาท
5. เมื่อกดชำระเงิน ตรวจสอบข้อมูลในฐานข้อมูลพบว่าออเดอร์ไม่ได้ถูกหักส่วนลด และยังเป็นราคาเต็ม

### Expected Behavior
1. `SelectPromotionModal.jsx` ควร Disable โปรโมชั่นที่ยอดสั่งซื้อ (`subtotal`) ไม่ผ่านเงื่อนไข `minOrderAmount` หรือ `PosScreen.jsx` ต้องไม่คำนวณลดราคาหากไม่เข้าเงื่อนไข
2. ออเดอร์ที่ถูกบันทึกลงในระบบ Backend ต้องมียอดตรงกับยอดสุทธิที่แคชเชียร์เรียกเก็บเงิน

### Actual Behavior
- ใน `PosScreen.jsx` การคำนวณ `promoDiscount` ไม่ได้นำ `appliedPromo.minOrderAmount` มาตรวจสอบ:
  ```javascript
  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === "PERCENT") return Math.min(subtotal * Number(appliedPromo.discountValue) / 100, subtotal);
    if (appliedPromo.discountType === "FIXED_AMOUNT") return Math.min(Number(appliedPromo.discountValue), subtotal);
    return 0;
  }, [appliedPromo, subtotal]);
  ```
- ใน `handleCheckout` มีการข้ามการส่งส่วนลดไปยัง Backend:
  ```javascript
  if (appliedPromo && promoDiscount > 0) {
    // ponytail: skip applyDiscount API call for now; total on backend will be untouched
    // and might differ from the on-screen `total` (which subtracts the promo locally).
  }
  ```

### Proposed Fix
1. เพิ่มเงื่อนไขตรวจสอบ `minOrderAmount`:
   ```javascript
   const promoDiscount = useMemo(() => {
     if (!appliedPromo) return 0;
     if (appliedPromo.minOrderAmount != null && subtotal < Number(appliedPromo.minOrderAmount)) {
       return 0;
     }
     if (appliedPromo.discountType === "PERCENT") return Math.min(subtotal * Number(appliedPromo.discountValue) / 100, subtotal);
     if (appliedPromo.discountType === "FIXED_AMOUNT") return Math.min(Number(appliedPromo.discountValue), subtotal);
     return 0;
   }, [appliedPromo, subtotal]);
   ```
2. ปรับปรุง `SelectPromotionModal.jsx` ให้รับ prop `subtotal` เข้ามา เพื่อแสดงสถานะให้แคชเชียร์ทราบว่าโปรโมชั่นใดยังใช้ไม่ได้
3. เชื่อมต่อ API ส่วนลด (หรือบันทึกข้อมูลส่วนลดลงออเดอร์) เพื่อให้ยอดฝั่ง Backend และ Frontend ตรงกัน
