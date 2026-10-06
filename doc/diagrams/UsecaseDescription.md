
---

# Use Case Description - Cafe POS System

---

### UC-01: Login

* **Actor:** Cashier, Admin


* **Description:** เข้าสู่ระบบเพื่อยืนยันตัวตนก่อนเข้าใช้งานฟังก์ชันต่างๆ ของ POS


* **Pre-conditions:** ระบบเปิดใช้งานอยู่ และผู้ใช้มีบัญชีในระบบ


* **Post-conditions:** ผู้ใช้เข้าสู่ระบบสำเร็จตามสิทธิ์ (Role) ของตนเอง


* **Main Success Scenario:**
1. Actor กรอก Username และ Password


2. Actor กดปุ่ม "Login"


3. ระบบตรวจสอบความถูกต้องของข้อมูล


4. ระบบอนุมัติและพาไปยังหน้าจอหลักตามสิทธิ์ของ Actor




* **Extensions:**
* 3a. ข้อมูลไม่ถูกต้อง ระบบแสดงข้อความแจ้งเตือน "Invalid Credentials" และให้กรอกใหม่





---

### UC-02: Browse Products by Category

* **Actor:** Cashier ( Admin สืบทอดสิทธิ์ )


* **Description:** ค้นหาและกรองรายการสินค้าตามหมวดหมู่เพื่อเตรียมรับออเดอร์


* **Pre-conditions:** Actor เข้าสู่ระบบสำเร็จและอยู่ที่หน้าขาย (POS Main)


* **Post-conditions:** ระบบแสดงรายการสินค้าตรงตามหมวดหมู่หรือคำค้นหา


* **Main Success Scenario:**
1. Cashier เลือกแท็บหมวดหมู่ (เช่น กาแฟ, ชา, ขนม) หรือกรอกคำค้นหาในช่อง Search


2. ระบบกรองและแสดงรายการสินค้าตามเงื่อนไข





---

### UC-03: Create Order (includes Add-ons)

* **Actor:** Cashier ( Admin สืบทอดสิทธิ์ )


* **Description:** สร้างรายการสั่งซื้อใหม่ เลือกสินค้า ปรับระดับความหวาน หรือเลือก Add-ons เสริม


* **Pre-conditions:** อยู่ในหน้าขาย (POS Main)


* **Post-conditions:** สินค้าพร้อมรายละเอียด Add-on ถูกเพิ่มลงในตะกร้าสินค้า


* **Main Success Scenario:**
1. Cashier คลิกเลือกสินค้าที่ต้องการ


2. (ถ้ามี Add-on) ระบบแสดง Popup ให้เลือก Add-on/ระดับความหวาน


3. Cashier ยืนยันการเลือก


4. ระบบคำนวณราคาและเพิ่มรายการลงในตะกร้าสินค้า





---

### UC-04: Process Payment (includes View/Print Receipt)

* **Actor:** Cashier ( Admin สืบทอดสิทธิ์ )


* **Description:** รับชำระเงิน ตัดชำระออเดอร์ และออกใบเสร็จรับเงิน


* **Pre-conditions:** มีรายการสินค้าอยู่ในตะกร้าอย่างน้อย 1 รายการ


* **Post-conditions:** บันทึกออเดอร์เข้าฐานข้อมูล แสดงหน้าสรุป/สั่งพิมพ์ใบเสร็จสำเร็จ


* **Main Success Scenario:**
1. Cashier ตรวจสอบรายการในตะกร้า และกดปุ่ม "Process Payment"


2. Cashier เลือกช่องทางการชำระเงิน (เงินสด / QR Code)


3. Cashier ระบุจำนวนเงินที่รับ หรือยืนยันการสแกน


4. ระบบบันทึกการขายและแสดงหน้าใบเสร็จรับเงิน (View/Print Receipt)




* **Extensions:**
* 3a. ยอดเงินรับมาน้อยกว่ายอดชำระ ระบบแจ้งเตือนให้ระบุจำนวนเงินใหม่





---

### UC-05: Manage Bills

* **Actor:** Cashier ( Admin สืบทอดสิทธิ์ )


* **Description:** ค้นหา ดูประวัติรายการบิล และสั่งพิมพ์ใบเสร็จย้อนหลัง (Reprint)


* **Pre-conditions:** Actor เข้าสู่ระบบสำเร็จ


* **Post-conditions:** ระบบแสดงรายละเอียดบิลย้อนหลัง และพิมพ์ใบเสร็จซ้ำได้


* **Main Success Scenario:**
1. Cashier เข้าสู่หน้า "Bill Management"


2. Cashier ค้นหาบิลตามเลขที่ออเดอร์ หรือช่วงเวลา


3. ระบบแสดงประวัติรายการบิล


4. Cashier กดเลือกบิลที่ต้องการเพื่อดูรายละเอียด หรือกดปุ่ม "Reprint"





---

### UC-06: Manage Products / Categories / Add-ons / Promotions

* **Actor:** Admin


* **Description:** จัดการข้อมูลหลักของร้าน (เพิ่ม แก้ไข ลบ เมนู, หมวดหมู่, Add-on, และส่วนลด)


* **Pre-conditions:** ผู้ใช้งานเข้าสู่ระบบด้วยสิทธิ์ Admin


* **Post-conditions:** ข้อมูลในฐานข้อมูลถูกอัปเดต และสะท้อนไปยังหน้าขายของ Cashier


* **Main Success Scenario:**
1. Admin เข้าสู่หน้าจัดการข้อมูล (เช่น Manage Products)


2. Admin เลือกทำรายการ (Create / Update / Delete)


3. Admin กรอก/แก้ไขข้อมูล และกดบันทึก


4. ระบบตรวจสอบความถูกต้องและบันทึกข้อมูลลงฐานข้อมูล





---
