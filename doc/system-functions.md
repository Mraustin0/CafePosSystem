# System Functions — Cafe POS

รายการฟังก์ชันของระบบ แบ่งตามโมดูล อ้างอิงฐานข้อมูลใน [data-dictionary.md](data-dictionary.md)

## ผู้ใช้งาน (Actors)

| Actor | คำอธิบาย |
| ----- | -------- |
| Admin | เจ้าของร้าน/ผู้จัดการ — จัดการผู้ใช้, เมนู, ดูรายงาน และทำทุกอย่างที่ Cashier ทำได้ |
| Cashier | พนักงานขาย — รับออเดอร์, รับชำระเงิน, ดูออเดอร์ |

---

## 1. Authentication & User Management

ตาราง: `users`, `user_profiles`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-01 | เข้าสู่ระบบ | ทุกคน | ใช้ username + password, ผู้ใช้ที่ `active = false` เข้าไม่ได้ |
| F-02 | ออกจากระบบ | ทุกคน | |
| F-03 | ดูโปรไฟล์ตัวเอง | ทุกคน | ชื่อ-นามสกุล, เบอร์โทร, อีเมล, role |
| F-04 | แก้ไขโปรไฟล์ตัวเอง | ทุกคน | แก้ได้เฉพาะ full_name, phone, email |
| F-05 | เปลี่ยนรหัสผ่าน | ทุกคน | ต้องใส่รหัสเดิมให้ถูก, เก็บเป็น hash |
| F-06 | ดูรายชื่อผู้ใช้ | Admin | มี pagination + sorting, กรองตาม role / active |
| F-07 | เพิ่มผู้ใช้ | Admin | สร้าง user + profile พร้อมกัน, username ซ้ำ → 409 |
| F-08 | แก้ไขผู้ใช้ | Admin | แก้ role และข้อมูลโปรไฟล์ |
| F-09 | ระงับ / เปิดใช้งานผู้ใช้ | Admin | เปลี่ยน `active` แทนการลบ (ผู้ใช้ที่เคยเปิดบิลลบไม่ได้) |

## 2. Category Management

ตาราง: `categories`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-10 | ดูหมวดหมู่ทั้งหมด | ทุกคน | |
| F-11 | เพิ่มหมวดหมู่ | Admin | ชื่อซ้ำ → 409 |
| F-12 | แก้ไขหมวดหมู่ | Admin | ชื่อซ้ำ → 409 |
| F-13 | ลบหมวดหมู่ | Admin | ลบไม่ได้ถ้ายังมีสินค้าในหมวด → 409 |

## 3. Product Management

ตาราง: `products`, `product_add_ons`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-14 | ดูรายการสินค้า | ทุกคน | pagination + sorting (ชื่อ, ราคา), กรองตามหมวด, ค้นหาตามชื่อ |
| F-15 | ดูรายละเอียดสินค้า | ทุกคน | แสดงหมวด และ add-on ที่เลือกได้ |
| F-16 | เพิ่มสินค้า | Admin | ต้องมีหมวด, ราคา ≥ 0 |
| F-17 | แก้ไขสินค้า | Admin | เปลี่ยนราคาแล้วบิลเก่าไม่เปลี่ยน (ใช้ `unit_price` snapshot) |
| F-18 | ปิดขาย / เปิดขายสินค้า | Admin | soft delete ด้วย `active` — สินค้าที่ปิดจะไม่แสดงในหน้าขาย |
| F-19 | กำหนด add-on ให้สินค้า | Admin | เลือกได้หลายตัว (Many-to-Many) |

## 4. Add-on Management

ตาราง: `add_ons`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-20 | ดูรายการ add-on | ทุกคน | |
| F-21 | เพิ่ม add-on | Admin | ชื่อซ้ำ → 409, ราคา ≥ 0 |
| F-22 | แก้ไข add-on | Admin | |
| F-23 | ปิด / เปิดใช้งาน add-on | Admin | |

## 5. Sales / Order (หน้าขาย POS)

ตาราง: `orders`, `order_items`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-24 | ดูเมนูสำหรับขาย | Cashier | แสดงเฉพาะสินค้า `active = true` แยกตามหมวด |
| F-25 | สร้างออเดอร์ | Cashier | เลือกสินค้า + จำนวน (> 0), ระบบสร้าง `order_number`, ผูกกับแคชเชียร์ที่ login, สถานะ `PENDING` |
| F-26 | แก้ไขรายการในออเดอร์ | Cashier | เพิ่ม / ลบ / เปลี่ยนจำนวน — ทำได้เฉพาะออเดอร์ `PENDING` |
| F-27 | คำนวณยอดออเดอร์ | ระบบ | subtotal = Σ(quantity × unit_price), total = subtotal − discount_amount |
| F-28 | ใช้ส่วนลด | Cashier | ไม่มีส่วนลด / ลดเป็น % / ลดเป็นจำนวนเงิน — ส่วนลดต้องไม่เกิน subtotal |
| F-29 | ยกเลิกออเดอร์ | Cashier | ยกเลิกได้เฉพาะ `PENDING` → `CANCELLED` |
| F-30 | ดูรายการออเดอร์ | ทุกคน | pagination + sorting, กรองตามสถานะ / ช่วงวันที่ / แคชเชียร์ (Cashier เห็นเฉพาะของตัวเอง) |
| F-31 | ดูรายละเอียดออเดอร์ / ใบเสร็จ | ทุกคน | รายการสินค้า, ยอดรวม, ส่วนลด, ข้อมูลการชำระเงิน |

## 6. Payment

ตาราง: `payments`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-32 | รับชำระเงิน | Cashier | เลือก CASH / QR_CODE / CARD, ออเดอร์ต้องเป็น `PENDING`, สำเร็จแล้วเปลี่ยนเป็น `PAID` |
| F-33 | คำนวณเงินทอน | ระบบ | เฉพาะ CASH: เงินที่รับ ≥ total, เงินทอน = เงินที่รับ − total |
| F-34 | ป้องกันชำระซ้ำ | ระบบ | 1 ออเดอร์ชำระได้ครั้งเดียว → 409 |

## 7. Reports

ตาราง: `orders`, `order_items`, `payments`

| ID | ฟังก์ชัน | Actor | รายละเอียด / เงื่อนไข |
| -- | -------- | ----- | --------------------- |
| F-35 | สรุปยอดขายรายวัน / ช่วงวันที่ | Admin | นับเฉพาะออเดอร์ `PAID`: จำนวนบิล, ยอดรวม, ส่วนลดรวม |
| F-36 | สินค้าขายดี | Admin | เรียงตามจำนวนที่ขายได้ในช่วงวันที่ |
| F-37 | ยอดขายแยกตามแคชเชียร์ | Admin | |
| F-38 | ยอดขายแยกตามช่องทางชำระเงิน | Admin | CASH / QR_CODE / CARD |

---

## Order Status Rules

| สถานะปัจจุบัน | ทำอะไรได้ | ไปเป็น |
| ------------- | --------- | ------ |
| `PENDING` | แก้รายการ, ใช้ส่วนลด, ชำระเงิน | `PAID` |
| `PENDING` | ยกเลิก | `CANCELLED` |
| `PAID` | ดูอย่างเดียว | — |
| `CANCELLED` | ดูอย่างเดียว | — |

## ข้อจำกัดของ Schema ปัจจุบัน

- **เลือก add-on ต่อรายการในบิล** (เช่น ลาเต้ + เพิ่มช็อต) ยังเก็บไม่ได้ — ตอนนี้มีแค่ "add-on ที่สินค้านี้เลือกได้" ถ้าจะทำต้องเพิ่มตาราง `order_item_add_ons (order_item_id, add_on_id, price)`
- **เงินที่รับมา** (สำหรับคำนวณเงินทอน) เก็บใน `payments.amount` — ถ้าต้องการแยก "ยอดที่ต้องจ่าย" กับ "เงินที่รับ" ต้องเพิ่มคอลัมน์

---

## การแบ่งงาน

ทุกคนทำครบทั้ง Backend (Entity → Repository → Service → Controller + DTO/Mapper + Unit Test) และหน้า Frontend ของโมดูลตัวเอง

| | Phakawat | Thana-nan | Kawinthida | Kanyawee |
| - | -------- | --------- | ---------- | -------- |
| **Branch** | `Phakawat_6733804189_04` | `Thana-nan_6733805868_04` | `Kawinthida_6733803905_04` | `Kanyawee_6733805737_04` |
| **โมดูล** | Auth & User Management | Menu Management | Sales / Order | Payment & Reports |
| **ฟังก์ชัน** | F-01 – F-09 | F-10 – F-23 | F-24 – F-31 | F-32 – F-38 |
| **ตาราง** | `users`, `user_profiles` | `categories`, `products`, `add_ons`, `product_add_ons` | `orders`, `order_items` | `payments` (+ query รายงาน) |
| **REST API** | `/api/v1/auth`, `/api/v1/users` | `/api/v1/categories`, `/api/v1/products`, `/api/v1/add-ons` | `/api/v1/orders`, `/api/v1/orders/{id}/items` | `/api/v1/orders/{id}/payment`, `/api/v1/reports` |
| **หน้า Frontend** | Login, โปรไฟล์, จัดการผู้ใช้ | จัดการหมวด / สินค้า / add-on | หน้าขาย POS (ตะกร้า), รายการออเดอร์, ใบเสร็จ | หน้าชำระเงิน, Dashboard รายงาน |
| **Design Pattern** (Behavioral) | — | — | **Strategy** — ส่วนลด (ไม่มี / % / จำนวนเงิน)<br>**State** — สถานะออเดอร์ | **Observer** — `OrderPaidEvent` (ApplicationEvent) หลังชำระเงิน |
| **งานส่วนกลาง** | Spring Security, `GlobalExceptionHandler` + Error Response, Docker / CI / Deploy (Render + Neon) | Pagination & Sorting (F-14) เป็นตัวอย่างให้ทีม | — | Seed data (Flyway V2) สำหรับ demo |
| **Diagram** (`doc/diagrams/`) | Use Case + Use Case Description, Component & Deployment | Domain Model, Class Diagram | Sequence Diagram (สร้างออเดอร์, ยกเลิก), State Diagram | Sequence Diagram (ชำระเงิน), Activity Diagram |
| **เอกสาร** | README | `design-patterns.md` (ส่วนรวม) | `solid-analysis.md` (ส่วนรวม) | Test Report (`test/`), Slide |

### ลำดับการทำงาน (Dependency)

1. **Phakawat** ทำ `GlobalExceptionHandler`, Error Response และ Security พื้นฐานก่อน — ทุกโมดูลใช้ร่วมกัน
2. **Thana-nan** ทำ Product API ก่อน — Order ต้องใช้สินค้า
3. **Kawinthida** ทำ Order API — Payment ต้องใช้ออเดอร์
4. **Kanyawee** เริ่ม Payment ได้พร้อมข้อ 3 โดยใช้ Order entity ที่มีอยู่แล้ว, รายงานทำหลังสุด

ระหว่างรอ API ของคนอื่น ให้ทำ Service + Unit Test (Mockito mock repository/service) ไปก่อนได้

### เอกสารส่วนรวม

`doc/solid-analysis.md` และ `doc/design-patterns.md` — คนที่ชื่ออยู่เป็นคนรวบรวม แต่ **ทุกคนเขียนส่วนที่อยู่ในโค้ดของตัวเอง** (ไฟล์ / บรรทัด / เหตุผล)
