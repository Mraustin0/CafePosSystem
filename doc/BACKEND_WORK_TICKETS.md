# Backend Work Tickets — v0.0.2 Candidates

Audit หลัง v0.0.1 release — ตอนนี้ backend ครบ 51 endpoints แต่ยังมีช่องว่างด้านคุณภาพ, DevOps, และ feature เสริมที่ frontend อนาคตจะต้องใช้

**หมวดหมู่:** 🧪 Tests · 🚀 DevOps · ⚙️ Features · 🔒 Security · 📊 Observability

---

## 🧪 Testing

### T01 — AuthController test coverage (missing)

- **Priority:** High (auth = security surface, zero coverage)
- **File:** `src/test/java/com/cafepos/controller/api/AuthControllerTest.java` (new)

Coverage goal:
- POST /auth/login success → returns JWT + user payload
- Invalid credentials → 401
- Missing fields → 400 (validation)
- Deactivated user cannot login
- Rate-limit sanity (if we add T06)

### T02 — PromotionController test coverage (missing)

- **Priority:** High
- **File:** `src/test/java/com/cafepos/controller/api/PromotionControllerTest.java` + `PromotionApiIntegrationTest.java`

Coverage:
- Full CRUD (create/list/get/update/delete/status toggle)
- Discount validation (percent 0-100, fixed > 0)
- Duplicate code → 409
- Non-admin → 403 for create/update/delete

### T03 — UserController test coverage (missing)

- **Priority:** High
- **File:** `src/test/java/com/cafepos/controller/api/UserControllerTest.java` + `UserApiIntegrationTest.java`

Coverage:
- CRUD users as admin
- `/me` + `/me/profile` + `/me/password` self-service flows
- Password length validation (8-72)
- Cannot deactivate yourself
- Non-admin cannot access other users' data

---

## 🚀 DevOps

### T04 — Spring Boot Actuator for health check

- **Priority:** Medium (Render + any monitor needs it)
- **Files:** `pom.xml` + `application.properties`

Add dependency:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```
Expose `/actuator/health` only (not full actuator). Update Render health check path.

### T05 — Dockerfile + docker-compose

- **Priority:** Medium (makes local onboarding + deploy portable)
- **Files:** `code/backend/Dockerfile` + `docker-compose.yml` (repo root)

Spring Boot multi-stage build (maven → slim JRE). docker-compose: backend + Postgres + nginx (frontend static) for one-command local demo.

### T06 — Expand CI workflow

- **Priority:** Low
- **File:** `.github/workflows/ci.yml`

Current ci.yml runs `./mvnw -B verify`. Add:
- Separate test + build jobs with artifact upload
- Frontend `npm run lint` + `npm run build` (verify dist/)
- Status checks required on main/develop before merge
- Dependabot config for weekly dep updates

---

## ⚙️ Features (backend first, UI later)

### T07 — Logout endpoint + token blacklist

- **Priority:** Medium (currently JWT is stateless — logout only clears localStorage; stolen token still valid until expiry)
- **File:** `AuthController.java` + new `TokenBlacklistService`

`POST /auth/logout` → add JTI to Redis/DB blacklist until expiry; JwtFilter checks blacklist. Alternative: short expiry (15min) + refresh token.

### T08 — CSV export for sales reports

- **Priority:** Low (BillManagementView has "ส่งออก Excel" button already — currently no backend)
- **File:** `ReportController.java`

Add 4 CSV endpoints parallel to existing JSON:
- `GET /reports/sales-summary.csv`
- `GET /reports/top-products.csv`
- `GET /reports/sales-by-cashier.csv`
- `GET /reports/sales-by-payment-method.csv`

Use `text/csv` content-type + `Content-Disposition: attachment`.

### T09 — Order quick-stats endpoint

- **Priority:** Low (would feed a POS top bar: "วันนี้ 42 ออเดอร์, ฿12,350")
- **File:** new `GET /orders/stats/today`

Returns `{ orderCount, netSales, avgOrderValue, pendingCount }` for logged-in cashier (admin sees all).

### T10 — Audit log

- **Priority:** Low
- **Files:** new entity `AuditEvent` + `AuditInterceptor` + migration

Track admin-sensitive actions:
- User created/deactivated
- Product/addon/promotion deleted
- Discount applied / order cancelled
- Password changed

Owner can review via `GET /audit?from=&to=`.

---

## 🔒 Security

### T11 — Rate limiting on `/auth/login`

- **Priority:** Medium (brute-force protection)
- **File:** `SecurityConfig.java` + Bucket4j filter

5 attempts per minute per IP. 429 Too Many Requests on exceed.

### T12 — Strong password validation

- **Priority:** Low (admin-created passwords could be weak)
- **File:** `CreateUserRequest.java` / `ChangePasswordRequest`

Enforce:
- Min 10 chars (currently 8)
- 1 uppercase + 1 digit + 1 symbol
- Not in common-passwords list

### T13 — Prevent self-deactivation

- **Priority:** Low (admin disabling own account locks system)
- **File:** `UserServiceImpl.setStatus()`

Reject if `targetId == currentUser.id()` with 400 "cannot deactivate self".

---

## 📊 Observability

### T14 — Structured JSON logging in prod

- **Priority:** Low (easier log aggregation on Render / future SIEM)
- **File:** `logback-spring.xml`

Add `logback-json-classic` encoder for `prod` profile. Keep plain for `dev`.

### T15 — Request correlation ID (X-Request-ID)

- **Priority:** Low
- **File:** new `RequestIdFilter`

Add `X-Request-ID` to every request (generate UUID if not present), echo in response, put into MDC for logs. Makes trace-through-logs trivial.

---

## Execution Order (recommended)

**Priority 1 — Test coverage before adding features:**
1. T01 AuthController (highest security risk)
2. T02 PromotionController
3. T03 UserController

**Priority 2 — DevOps essentials:**
4. T04 Actuator health check (quick + Render needs it)
5. T05 Dockerfile (ship-ability)

**Priority 3 — Nice-to-have features:**
6. T08 CSV export (BillManagement button already exists)
7. T09 Order quick-stats
8. T11 Rate limiting (security hardening)

**Backlog:** T06 (CI), T07 (logout), T10 (audit), T12-T15 (polish)
