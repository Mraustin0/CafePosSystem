# Module Guide — วิธีทำโมดูลใหม่

ใช้โมดูล **Category** เป็นต้นแบบ ก๊อปโครงแล้วเปลี่ยนชื่อ ห้ามข้าม Layer (Controller เรียก Repository ตรง ๆ = ผิด)

```
Controller  →  Service (interface)  →  Repository  →  Entity
    ↑               ↑ impl                 
 Request/Response DTO  ←→  Mapper
```

## ไฟล์ที่ต้องสร้าง (ตามลำดับ)

| # | ไฟล์ต้นแบบ | หน้าที่ |
| - | ---------- | ------- |
| 1 | `repository/CategoryRepository.java` | interface ต่อ `JpaRepository` — เขียนแค่ชื่อ method เช่น `existsByNameIgnoreCase` Spring สร้าง query ให้ |
| 2 | `dto/request/CategoryRequest.java` | `record` + Bean Validation (`@NotBlank`, `@Size`, `@Positive` …) — ห้ามมี `id` |
| 3 | `dto/response/CategoryResponse.java` | `record` ข้อมูลที่ส่งออก — **ห้ามคืน Entity ออกจาก API** |
| 4 | `mapper/CategoryMapper.java` | `toEntity`, `updateEntity`, `toResponse` |
| 5 | `service/CategoryService.java` | interface — Controller ขึ้นกับตัวนี้ (DIP) |
| 6 | `service/impl/CategoryServiceImpl.java` | business logic + `@Transactional` + โยน exception |
| 7 | `controller/api/CategoryController.java` | รับ/ส่ง HTTP อย่างเดียว ไม่มี logic |
| 8 | `test/.../CategoryServiceImplTest.java` | Unit test ด้วย Mockito |
| 9 | `test/.../CategoryControllerTest.java` | `@WebMvcTest` เช็ค status code + JSON |

## กฎที่ทุกโมดูลต้องทำเหมือนกัน

- **Constructor Injection เท่านั้น** — ห้ามใช้ `@Autowired` บน field
- Service class ใส่ `@Transactional(readOnly = true)` แล้วใส่ `@Transactional` ทับที่ method ที่เขียนข้อมูล
- **ห้าม** `try/catch` ใน Controller — โยน exception แล้วให้ `GlobalExceptionHandler` จัดการ

| สถานการณ์ | ทำอะไร | ได้ Status |
| --------- | ------ | ---------- |
| หา id ไม่เจอ | `throw new ResourceNotFoundException("Product", id)` | 404 |
| ข้อมูลซ้ำ / ทำไม่ได้เพราะข้อมูลอื่นอ้างอยู่ / สถานะไม่ถูก | `throw new ConflictException("...")` | 409 |
| Request ไม่ผ่าน `@Valid` | ไม่ต้องทำอะไร | 400 + `fieldErrors` |
| JSON พัง / id ไม่ใช่ตัวเลข | ไม่ต้องทำอะไร | 400 |

| HTTP | ใช้กับ | คืนค่า |
| ---- | ------ | ------ |
| `GET /api/v1/xxx` | ดูทั้งหมด | 200 |
| `GET /api/v1/xxx/{id}` | ดูตัวเดียว | 200 / 404 |
| `POST /api/v1/xxx` | สร้าง | **201** + header `Location` |
| `PUT /api/v1/xxx/{id}` | แก้ไข | 200 / 404 / 409 |
| `DELETE /api/v1/xxx/{id}` | ลบ | **204** / 404 / 409 |

## Error Response (ทุก API ตอบรูปแบบนี้)

```json
{
  "timestamp": "2026-09-14T13:46:14.023Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/categories",
  "fieldErrors": { "name": "name is required" }
}
```

Frontend เช็ค `status` แล้วแสดง `message` หรือ `fieldErrors` ใต้ช่องกรอกได้เลย

## ทดสอบ

```bash
cd code/backend
./mvnw test                                   # รัน test ทั้งหมด
./mvnw test -Dtest=CategoryServiceImplTest    # รันไฟล์เดียว
```

ลองยิงจริง: `docker compose up -d db` → `./mvnw spring-boot:run` → เปิด http://localhost:8080/swagger-ui.html
