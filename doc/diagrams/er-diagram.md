# ER Diagram — Cafe POS

Source of truth: `code/backend/src/main/resources/db/migration/V1__init_schema.sql`

```mermaid
erDiagram
    users ||--|| user_profiles : "has"
    users ||--o{ orders : "creates (cashier)"
    categories ||--o{ products : "contains"
    products ||--o{ product_add_ons : ""
    add_ons ||--o{ product_add_ons : ""
    orders ||--|{ order_items : "contains"
    products ||--o{ order_items : "ordered as"
    orders ||--o| payments : "paid by"

    users {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR password_hash
        VARCHAR role "ADMIN | CASHIER"
        BOOLEAN active
        TIMESTAMPTZ created_at
    }
    user_profiles {
        BIGINT user_id PK, FK
        VARCHAR full_name
        VARCHAR phone
        VARCHAR email
    }
    categories {
        BIGINT id PK
        VARCHAR name UK
    }
    products {
        BIGINT id PK
        BIGINT category_id FK
        VARCHAR name
        NUMERIC price
        VARCHAR image_url
        BOOLEAN active
    }
    add_ons {
        BIGINT id PK
        VARCHAR name UK
        NUMERIC price
        BOOLEAN active
    }
    product_add_ons {
        BIGINT product_id PK, FK
        BIGINT add_on_id PK, FK
    }
    orders {
        BIGINT id PK
        VARCHAR order_number UK
        BIGINT cashier_id FK
        VARCHAR status "PENDING | PAID | CANCELLED"
        NUMERIC subtotal
        NUMERIC discount_amount
        NUMERIC total
        TIMESTAMPTZ created_at
    }
    order_items {
        BIGINT id PK
        BIGINT order_id FK
        BIGINT product_id FK
        INT quantity
        NUMERIC unit_price
    }
    payments {
        BIGINT id PK
        BIGINT order_id FK, UK
        VARCHAR method "CASH | QR_CODE | CARD"
        NUMERIC amount
        TIMESTAMPTZ paid_at
    }
```

## Relationships

| ประเภท | ตาราง | Cardinality | JPA Mapping | Fetch / Cascade | เหตุผล |
| ------ | ----- | ----------- | ----------- | --------------- | ------ |
| One-to-One | `users` — `user_profiles` | 1 : 1 | `UserProfile.user` `@OneToOne @MapsId` | LAZY / DB `ON DELETE CASCADE` | Shared PK — profile ไม่มีความหมายถ้าไม่มี user |
| One-to-One | `orders` — `payments` | 1 : 0..1 | `Payment.order` `@OneToOne` (`order_id` UNIQUE) | LAZY / ไม่มี cascade | ออเดอร์ที่ยัง PENDING ยังไม่มี payment, จ่ายได้ครั้งเดียว |
| One-to-Many | `categories` → `products` | 1 : N | `Product.category` `@ManyToOne` | LAZY / ไม่มี cascade | ลบหมวดที่ยังมีสินค้าไม่ได้ (FK RESTRICT) |
| One-to-Many | `users` → `orders` | 1 : N | `Order.cashier` `@ManyToOne` | LAZY / ไม่มี cascade | เก็บว่าใครเปิดบิล, ลบ user ที่มีบิลไม่ได้ |
| One-to-Many | `orders` → `order_items` | 1 : 1..N | `Order.items` `@OneToMany(mappedBy)` ↔ `OrderItem.order` | LAZY / `CascadeType.ALL` + `orphanRemoval` | รายการในบิลเกิดและตายพร้อมออเดอร์ |
| One-to-Many | `products` → `order_items` | 1 : N | `OrderItem.product` `@ManyToOne` | LAZY / ไม่มี cascade | สินค้าที่เคยขายห้ามลบจริง (ใช้ `active=false`) |
| Many-to-Many | `products` — `add_ons` | M : N | `Product.addOns` `@ManyToMany @JoinTable` | LAZY (default) / ไม่มี cascade | add-on จัดการแยก, ตาราง join ไม่มีข้อมูลเพิ่ม |
