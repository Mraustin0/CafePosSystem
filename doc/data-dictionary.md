# Data Dictionary — Cafe POS

- DBMS: PostgreSQL 17
- Migration: Flyway — `code/backend/src/main/resources/db/migration/`
  - `V1__init_schema.sql` — ตารางหลัก
  - `V2__seed_demo_data.sql` — ข้อมูลตัวอย่าง
  - `V3__order_item_add_ons.sql` — add-on ที่เลือกในแต่ละรายการของบิล
  - `V4__order_discount_rule.sql` — เก็บแบบส่วนลดใน `orders` เพื่อคำนวณใหม่เมื่อแก้รายการ
- ER Diagram: [diagrams/er-diagram.md](diagrams/er-diagram.md)

คำย่อ: **PK** Primary Key · **FK** Foreign Key · **UK** Unique · **NN** Not Null · **IDENTITY** เลขรันอัตโนมัติ

---

## 1. `users` — ผู้ใช้งานระบบ

Entity: `domain/entity/User.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัสผู้ใช้ |
| username | VARCHAR(50) | NN, UK | | ชื่อสำหรับเข้าสู่ระบบ |
| password_hash | VARCHAR(255) | NN | | รหัสผ่านที่ hash แล้ว (ห้ามเก็บ plain text) |
| role | VARCHAR(20) | NN, CHECK IN (`ADMIN`, `CASHIER`) | | สิทธิ์ผู้ใช้ — enum `Role` |
| active | BOOLEAN | NN | `TRUE` | `false` = ระงับการใช้งาน |
| created_at | TIMESTAMPTZ(6) | NN | | วันเวลาที่สร้าง (`@CreationTimestamp`) |

## 2. `user_profiles` — ข้อมูลส่วนตัวของผู้ใช้ (1:1 กับ `users`)

Entity: `domain/entity/UserProfile.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| user_id | BIGINT | PK, FK → `users.id` ON DELETE CASCADE | | ใช้ PK ร่วมกับ `users` (`@MapsId`) |
| full_name | VARCHAR(100) | NN | | ชื่อ-นามสกุล |
| phone | VARCHAR(20) | | | เบอร์โทร |
| email | VARCHAR(100) | | | อีเมล |

## 3. `categories` — หมวดหมู่สินค้า

Entity: `domain/entity/Category.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัสหมวด |
| name | VARCHAR(50) | NN, UK | | ชื่อหมวด เช่น Coffee, Tea, Bakery |

## 4. `products` — สินค้า/เมนู

Entity: `domain/entity/Product.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัสสินค้า |
| category_id | BIGINT | NN, FK → `categories.id` | | หมวดของสินค้า |
| name | VARCHAR(100) | NN | | ชื่อเมนู |
| price | NUMERIC(10,2) | NN, CHECK ≥ 0 | | ราคาขายปัจจุบัน (บาท) |
| image_url | VARCHAR(500) | | | URL รูปสินค้า |
| active | BOOLEAN | NN | `TRUE` | soft delete — `false` = ไม่แสดงในหน้าขาย |

## 5. `add_ons` — ตัวเลือกเพิ่มเติม

Entity: `domain/entity/AddOn.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัส add-on |
| name | VARCHAR(50) | NN, UK | | เช่น Extra Shot, Oat Milk |
| price | NUMERIC(10,2) | NN, CHECK ≥ 0 | | ราคาที่บวกเพิ่ม (บาท) |
| active | BOOLEAN | NN | `TRUE` | `false` = ปิดใช้งาน |

## 6. `product_add_ons` — add-on ที่เลือกได้ของแต่ละสินค้า (M:N)

Mapping: `Product.addOns` (`@ManyToMany @JoinTable`) — ไม่มี entity แยก

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| product_id | BIGINT | PK, FK → `products.id` ON DELETE CASCADE | | สินค้า |
| add_on_id | BIGINT | PK, FK → `add_ons.id` ON DELETE CASCADE | | add-on |

## 7. `orders` — ออเดอร์/บิลขาย

Entity: `domain/entity/Order.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัสออเดอร์ |
| order_number | VARCHAR(20) | NN, UK | | เลขที่บิลที่แสดงบนใบเสร็จ |
| cashier_id | BIGINT | NN, FK → `users.id` | | แคชเชียร์ที่เปิดบิล |
| status | VARCHAR(20) | NN, CHECK IN (`PENDING`, `PAID`, `CANCELLED`) | `PENDING` (ใน entity) | สถานะ — enum `OrderStatus` |
| subtotal | NUMERIC(10,2) | NN, CHECK ≥ 0 | | ผลรวมราคาทุกรายการ (รวมค่า add-on) ก่อนส่วนลด — ดูสูตรที่ `order_items` |
| discount_type | VARCHAR(20) | NN, CHECK IN (`NONE`, `PERCENT`, `FIXED_AMOUNT`) | `NONE` | แบบส่วนลด — enum `DiscountType` (เลือก `DiscountStrategy`) |
| discount_value | NUMERIC(10,2) | CHECK ≥ 0 | | ค่าที่แคชเชียร์กรอก: `PERCENT` = เปอร์เซ็นต์ (10 = 10%), `FIXED_AMOUNT` = บาท, `NONE` = ว่าง |
| discount_amount | NUMERIC(10,2) | NN, CHECK ≥ 0 | `0` | จำนวนเงินที่ลดจริง คำนวณจาก `discount_type` + `discount_value` + `subtotal` |
| total | NUMERIC(10,2) | NN, CHECK ≥ 0 | | ยอดสุทธิ = subtotal − discount_amount |
| created_at | TIMESTAMPTZ(6) | NN | | วันเวลาที่เปิดบิล |

> เก็บ subtotal/discount/total ไว้ในตาราง (ไม่คำนวณสด) เพื่อให้บิลเก่าไม่เปลี่ยนเมื่อกฎส่วนลดเปลี่ยน
>
> เก็บ `discount_type` + `discount_value` ไว้ด้วย เมื่อแก้รายการในบิล (PENDING) ระบบคำนวณส่วนลดใหม่จากยอดใหม่
> เช่น ลด 10% ยอด 160 → 16.00, แก้รายการเหลือ 55 → 5.50 · ถ้าลดแบบจำนวนเงินแล้วเกินยอดใหม่ ระบบปฏิเสธการแก้ (400) ต้องแก้ส่วนลดก่อน
>
> ออเดอร์ที่มีส่วนลดก่อน V4 ถูกบันทึกเป็น `FIXED_AMOUNT` เท่ากับ `discount_amount` เดิม (ยอดไม่เปลี่ยน)

## 8. `order_items` — รายการสินค้าในออเดอร์

Entity: `domain/entity/OrderItem.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัสรายการ |
| order_id | BIGINT | NN, FK → `orders.id` ON DELETE CASCADE | | ออเดอร์ที่รายการนี้อยู่ |
| product_id | BIGINT | NN, FK → `products.id` | | สินค้าที่สั่ง |
| quantity | INT | NN, CHECK > 0 | | จำนวน |
| unit_price | NUMERIC(10,2) | NN, CHECK ≥ 0 | | ราคาสินค้าต่อหน่วย **ณ เวลาที่สั่ง** (snapshot) ไม่รวม add-on |

> ยอดของรายการ (ไม่เก็บในตาราง คำนวณจาก snapshot) = `quantity × (unit_price + Σ order_item_add_ons.price)`
> เช่น Latte 60 + Oat Milk 20, จำนวน 2 → 2 × (60 + 20) = **160**

## 9. `order_item_add_ons` — add-on ที่เลือกในแต่ละรายการของบิล (M:N พร้อมข้อมูล)

Mapping: `OrderItem.addOns` (`@ElementCollection` ของ `@Embeddable OrderItemAddOn`) — ไม่มี entity / repository แยก

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| order_item_id | BIGINT | PK, FK → `order_items.id` ON DELETE CASCADE | | รายการในบิล |
| add_on_id | BIGINT | PK, FK → `add_ons.id` | | add-on ที่เลือก |
| price | NUMERIC(10,2) | NN, CHECK ≥ 0 | | ราคา add-on **ณ เวลาที่สั่ง** (snapshot) ต่อ 1 หน่วยสินค้า |

- PK `(order_item_id, add_on_id)` → add-on ตัวเดียวกันเลือกได้ครั้งเดียวต่อรายการ
- add-on ที่เลือกได้ต้อง `active = true` และอยู่ใน `product_add_ons` ของสินค้านั้น (ตรวจใน Service → 400)
- ต่างจาก `product_add_ons`: ตารางนั้นคือ "เลือก**ได้**อะไรบ้าง" ตารางนี้คือ "เลือก**ไป**แล้วอะไรบ้าง"

## 10. `payments` — การชำระเงิน (1:1 กับ `orders`)

Entity: `domain/entity/Payment.java`

| Column | Type | Constraint | Default | คำอธิบาย |
| ------ | ---- | ---------- | ------- | -------- |
| id | BIGINT | PK, IDENTITY | | รหัสการชำระ |
| order_id | BIGINT | NN, UK, FK → `orders.id` | | ออเดอร์ที่ชำระ (UNIQUE = 1 ออเดอร์ 1 payment) |
| method | VARCHAR(20) | NN, CHECK IN (`CASH`, `QR_CODE`, `CARD`) | | ช่องทาง — enum `PaymentMethod` |
| amount | NUMERIC(10,2) | NN, CHECK ≥ 0 | | จำนวนเงินที่ชำระ |
| paid_at | TIMESTAMPTZ(6) | NN | | วันเวลาที่ชำระ |

---

## Indexes

PostgreSQL สร้าง index ให้ PK และ UNIQUE อัตโนมัติ แต่ **ไม่สร้างให้ FK** จึงต้องสร้างเอง

| Index | Table (Columns) | เหตุผล |
| ----- | --------------- | ------ |
| `idx_products_category` | products (category_id) | ดึงสินค้าตามหมวดในหน้าขาย |
| `idx_product_add_ons_add_on` | product_add_ons (add_on_id) | ค้นย้อนจาก add-on → สินค้า (PK ครอบคลุมทิศ product_id แล้ว) |
| `idx_orders_cashier` | orders (cashier_id) | ดูยอดขายรายแคชเชียร์ |
| `idx_orders_status_created` | orders (status, created_at) | รายงานยอดขายตามสถานะ + ช่วงวันที่ |
| `idx_order_items_order` | order_items (order_id) | โหลดรายการของบิล |
| `idx_order_items_product` | order_items (product_id) | รายงานสินค้าขายดี / เช็คก่อนลบสินค้า |
| `idx_order_item_add_ons_add_on` | order_item_add_ons (add_on_id) | ค้นย้อนจาก add-on → รายการที่ขาย (PK ครอบคลุมทิศ order_item_id แล้ว) |

## Foreign Key Delete Rules

| FK | ON DELETE | เหตุผล |
| -- | --------- | ------ |
| user_profiles.user_id → users | CASCADE | profile เป็นส่วนหนึ่งของ user |
| products.category_id → categories | RESTRICT | ห้ามลบหมวดที่ยังมีสินค้า |
| product_add_ons.* → products / add_ons | CASCADE | ลบแค่ความสัมพันธ์ ไม่กระทบข้อมูลหลัก |
| orders.cashier_id → users | RESTRICT | บิลต้องอ้างถึงผู้ขายได้เสมอ (ใช้ `active=false` แทนการลบ) |
| order_items.order_id → orders | CASCADE | รายการไม่มีความหมายถ้าไม่มีบิล |
| order_items.product_id → products | RESTRICT | รักษาประวัติการขาย (ใช้ `active=false`) |
| order_item_add_ons.order_item_id → order_items | CASCADE | add-on ที่เลือกไม่มีความหมายถ้าไม่มีรายการ |
| order_item_add_ons.add_on_id → add_ons | RESTRICT | ห้ามลบ add-on ที่เคยขายไปแล้ว (ใช้ `active=false`) |
| payments.order_id → orders | RESTRICT | ห้ามลบบิลที่ชำระแล้ว |
