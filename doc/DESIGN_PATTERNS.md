# Design Patterns ในโปรเจกต์ Cafe POS System

---

## ภาพรวม

| Pattern | Location | วัตถุประสงค์ |
|---------|----------|-------------|
| **Strategy** | `service/discount/` | เพิ่มรูปแบบส่วนลดใหม่โดยไม่แตะ OrderService |
| **State** | `domain/state/` | ควบคุมว่า Order ทำอะไรได้ตาม status |
| **Observer** | `service/listener/` + `ApplicationEventPublisher` | บันทึก audit log หลังชำระเงินโดยไม่ยุ่งกับ payment logic |
| **Repository** | `repository/*.java` | abstraction ของ data access layer |
| **Layered Architecture** | ทุก layer | Controller → Service → Repository → Domain |

---

## 1. Strategy Pattern — DiscountStrategy

### ปัญหา
การคำนวณส่วนลดมีหลายรูปแบบ: ลดเป็นเปอร์เซ็นต์, ลดเป็นจำนวนเงิน, ไม่มีส่วนลด ถ้าเขียน if/else ทั้งหมดไว้ใน `OrderServiceImpl` ทุกครั้งที่เพิ่มประเภทส่วนลดใหม่ต้องแก้ service

### วิธีแก้
แยก logic การคำนวณออกเป็น class ต่างหากที่ implement interface เดียวกัน

```java
// Interface — ปิดสำหรับแก้ไข
public interface DiscountStrategy {
    DiscountType type();
    BigDecimal calculate(BigDecimal subtotal, BigDecimal value);
}

// เพิ่มส่วนลดรูปแบบใหม่ = สร้าง @Component ใหม่เท่านั้น
@Component public class FixedAmountDiscount implements DiscountStrategy { ... }
@Component public class PercentDiscount     implements DiscountStrategy { ... }
@Component public class NoDiscount          implements DiscountStrategy { ... }
```

`OrderServiceImpl` ไม่รู้จัก concrete class เลย — Spring inject ผ่าน `Map<DiscountType, DiscountStrategy>` ตอน startup และมี guard ตรวจว่าทุก DiscountType มี strategy ครบ:

```java
if (this.discountStrategies.size() != DiscountType.values().length) {
    throw new IllegalStateException("Missing discount strategy...");
}
```

### ผลลัพธ์
เพิ่มส่วนลดใหม่ เช่น "ซื้อครบ 200 ลด 20%" แค่สร้าง class ใหม่ ไม่แตะโค้ดเดิมแม้แต่บรรทัดเดียว — ตรงตาม **Open/Closed Principle**

---

## 2. State Pattern — OrderState

### ปัญหา
Order มี 3 status: `PENDING`, `PAID`, `CANCELLED` — แต่ละ status ทำได้ไม่เหมือนกัน เช่น PAID ยกเลิกไม่ได้, CANCELLED จ่ายเงินไม่ได้ ถ้าใช้ if/else ใน service โค้ดจะยุ่งเหยิงเมื่อเพิ่ม status ใหม่

### วิธีแก้
แต่ละ status เป็น class ของตัวเอง ถือ rule ของตัวเอง

```java
public sealed interface OrderState permits PendingOrderState, PaidOrderState, CancelledOrderState {
    void ensureModifiable();
    OrderStatus cancel();
    OrderStatus pay();

    static OrderState of(OrderStatus status) {
        return switch (status) {
            case PENDING   -> PendingOrderState.INSTANCE;
            case PAID      -> PaidOrderState.INSTANCE;
            case CANCELLED -> CancelledOrderState.INSTANCE;
        };
    }
}
```

`Order.java` เรียกใช้โดยไม่ต้อง instanceof check:

```java
// ไม่ต้องรู้ว่า status ไหนอยู่ข้างใน
public void cancel() {
    status = OrderState.of(status).cancel();
}
```

### ผลลัพธ์
เพิ่ม status ใหม่เช่น `REFUNDED` แค่สร้าง `RefundedOrderState` ใหม่ ไม่ต้องแตะ `Order.java` หรือ `OrderServiceImpl.java`

---

## 3. Observer Pattern — SaleAuditLogListener

### ปัญหา
หลังชำระเงินสำเร็จ ระบบต้องบันทึก audit log แต่ถ้าเขียนโค้ด log ไว้ใน `PaymentServiceImpl` โดยตรง จะทำให้ service รู้เรื่อง logging ซึ่งไม่ใช่หน้าที่ของมัน

### วิธีแก้
`PaymentServiceImpl` แค่ publish event — ไม่รู้ว่าใครฟังอยู่

```java
// PaymentServiceImpl — รู้แค่ว่า "บางอย่างเกิดขึ้น" ไม่รู้ว่าใครจะทำอะไร
eventPublisher.publishEvent(new OrderPaidEvent(...));
```

`SaleAuditLogListener` ฟัง event และบันทึก log หลัง transaction commit จริง ๆ

```java
@Component
public class SaleAuditLogListener {
    @TransactionalEventListener   // ทำงานหลัง commit เท่านั้น — ไม่ log ถ้า transaction rollback
    public void onOrderPaid(OrderPaidEvent event) {
        log.info("SALE order={} cashier={} method={} total={}...", ...);
    }
}
```

### ผลลัพธ์
เพิ่ม listener ใหม่ เช่น ส่ง LINE Notify หลังขาย ไม่ต้องแตะ `PaymentServiceImpl` เลย — ตรงตาม **Open/Closed + Single Responsibility Principle**

---

## 4. Repository Pattern

### ปัญหา
Service layer ไม่ควรรู้ว่าข้อมูลมาจากไหน (PostgreSQL, H2, cache) ถ้ารู้จะเปลี่ยน database ยาก

### วิธีแก้
ทุก repository extends `JpaRepository` — Spring Data JPA สร้าง implementation ให้อัตโนมัติ Service เห็นแค่ interface

```java
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    // Spring สร้าง SQL ให้เองจากชื่อ method
    boolean existsByProductsId(Long productId);
}
```

ใน test ใช้ H2 in-memory แทน PostgreSQL ได้เลย service ไม่รู้ความต่างเลย

---

## สรุป

Pattern ทั้ง 4 ตัวทำงานร่วมกัน:

```
HTTP Request
    ↓
Controller  (รับ request, ไม่มี logic)
    ↓
Service     (ใช้ Strategy เลือกวิธีคำนวณส่วนลด)
            (ใช้ State ตรวจสิทธิ์ตาม order status)
            (publish Event ให้ Observer รับไป)
    ↓
Repository  (abstraction — ไม่สนว่า DB คืออะไร)
    ↓
Database
```

> ผลลัพธ์คือระบบที่ **เพิ่ม feature ได้โดยไม่แก้โค้ดเดิม** และ **test แต่ละส่วนแยกกันได้อิสระ**
