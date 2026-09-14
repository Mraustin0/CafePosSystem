# Cafe POS System

<!-- TODO: คำอธิบายระบบ 3–5 บรรทัด -->
ระบบ Point of Sale สำหรับร้านกาแฟ พัฒนาด้วย Spring Boot + React
รายวิชา CP353002 Principles of Software Design and Development

## สมาชิกกลุ่ม

<!-- TODO: เติมนามสกุลให้ครบ -->

| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา | Section | Branch | หน้าที่รับผิดชอบ |
| ----- | ------------ | ------------ | ------- | ------ | ---------------- |
| 1 | Phakawat | 6733804189 | 04 | `Phakawat_6733804189_04` | Auth & User Management (F-01–09), Security, Exception Handler, Docker / CI / Deploy |
| 2 | Thana-nan | 6733805868 | 04 | `Thana-nan_6733805868_04` | Menu Management: Category, Product, Add-on (F-10–23) |
| 3 | Kawinthida | 6733803905 | 04 | `Kawinthida_6733803905_04` | Sales / Order + หน้าขาย POS (F-24–31) |
| 4 | Kanyawee | 6733805737 | 04 | `Kanyawee_6733805737_04` | Payment & Reports (F-32–38) |

รายละเอียดการแบ่งงาน: [doc/system-functions.md](doc/system-functions.md#การแบ่งงาน)

## Tech Stack

| ส่วน | เทคโนโลยี |
| ---- | --------- |
| Backend | Spring Boot 4.1 (Java 21), Maven |
| Database | PostgreSQL 17 + Flyway migration |
| ORM | Spring Data JPA (Hibernate) |
| API Docs | springdoc-openapi (Swagger UI) |
| Frontend | React + Vite |
| Testing | JUnit 5 + Mockito + Spring Boot Test (H2 สำหรับ test) |
| Deployment | Docker, Render (app) + Neon (PostgreSQL) |
| CI | GitHub Actions |

## System Architecture

Layered Architecture: `controller → service → repository → domain` (+ `dto`, `mapper`, `config`, `exception`, `common`)

Production: React build ถูก copy เข้า Spring Boot เป็น static files → deploy เป็น image เดียว (same origin, ไม่ต้องตั้ง CORS)

<!-- TODO: ใส่ Component / Deployment Diagram จาก doc/diagrams -->

## Database Design (ER Diagram)

8 ตาราง — One-to-One (`users`–`user_profiles`, `orders`–`payments`), One-to-Many, Many-to-Many (`products`–`add_ons`)

- ER Diagram: [doc/diagrams/er-diagram.md](doc/diagrams/er-diagram.md)
- Data Dictionary: [doc/data-dictionary.md](doc/data-dictionary.md)

## Installation & Setup

ต้องมี: JDK 21+, Node.js 20+, Docker

```bash
git clone <repo-url>
cd CafePosSystem/code/frontend && npm install
```

## How to Run

**Dev (แนะนำ)** — รัน DB ใน Docker, backend/frontend บนเครื่อง

```bash
cd code
docker compose up -d db              # PostgreSQL :5433 (กันชนกับ Postgres ที่ลงในเครื่อง)
cd backend && ./mvnw spring-boot:run # API :8080
cd frontend && npm run dev           # UI :5173 (proxy /api → :8080)
```

**ทั้งระบบใน Docker**

```bash
cd code
docker compose up --build            # http://localhost:8080
```

Environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PORT`

## API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## How to Run Tests

```bash
cd code/backend
./mvnw test
```

## Deployment URL

<!-- TODO -->

## Project Structure

```
├── code/
│   ├── backend/            # Spring Boot
│   │   └── src/main/java/com/cafepos/
│   │       ├── config/
│   │       ├── controller/api/
│   │       ├── service/impl/
│   │       ├── repository/
│   │       ├── domain/{entity,enums}/
│   │       ├── dto/{request,response}/
│   │       ├── mapper/
│   │       ├── exception/
│   │       └── common/
│   ├── frontend/           # React + Vite
│   ├── Dockerfile
│   └── docker-compose.yml
├── test/                   # Test report
├── doc/
│   ├── diagrams/
│   └── slide/
└── img/
```

## Git Workflow

- `main` — production (merge ผ่าน PR เท่านั้น)
- `develop` — integration
- `ชื่อ_รหัสนักศึกษา_section` — branch ส่วนตัว → PR เข้า `develop` (reviewer ≥ 1 คน)
- Commit message: `<type>: <สิ่งที่ทำ>` (feat, fix, refactor, test, docs, chore)
# CafePosSystem
