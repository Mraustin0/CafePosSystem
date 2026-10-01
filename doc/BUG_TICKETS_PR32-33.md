# Action Tickets — After PR #29-#33 merge

หลัง fetch origin/develop เจอ PR ใหม่ที่ merge เข้ามา 5 PR:
- PR #29 (Thana-nan) — payment button color + font sizes
- PR #30 (Thana-nan) — remove symbol + wording
- PR #31, #33 (Kawinthida) — BillManagementView layout + addon edit/delete + refined UI
- PR #32 (Kanyawee) — AddUserPage + LoginPage fixes + password toggle

**หลักการ (user's rule):** ห้ามเตะ front, ให้ port UI verbatim จาก pos-demo/friends' branches → wire backend เฉพาะ handler/state

---

## 🎫 K01 — Port Kawinthida's AddonManagementView (edit + delete modals) + wire backend

- **Type:** Feature Port + Backend Wiring
- **Priority:** High
- **Source:** [`pos-demo/src/AddonManagementView.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/pos-demo/src/AddonManagementView.jsx) (Kawinthida, 418 lines)
- **Target:** `code/frontend/src/components/PosScreen/AddonManagementView.jsx`

### What Kawinthida added
- Category filter tabs (all/coffee/tea/snack)
- Edit modal — name, desc, price, category
- Delete modal — confirmation dialog
- Props: `{ addons, onToggleStatus, onAddAddon, onEditAddon, onDeleteAddon }`

### Backend constraints
- `updateAddOn(id, {name, price})` — backend ไม่มี field `desc` / `category` → เก็บใน frontend state เฉพาะ (backend ไม่ persist)
- ไม่มี `deleteAddOn` endpoint จริง → `onDeleteAddon` ยิง `setAddOnStatus(id, false)` (soft-delete)

### Acceptance
- Copy pos-demo AddonManagementView.jsx verbatim
- PosScreen.jsx เพิ่ม onEditAddon → updateAddOn, onDeleteAddon → setAddOnStatus(false) + loadAddons()

---

## 🎫 K02 — Port Kawinthida's latest BillManagementView layout tweaks

- **Type:** UI Port
- **Priority:** Medium
- **Source:** [`pos-demo/src/BillManagementView.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/pos-demo/src/BillManagementView.jsx) (commit `8fd99aa` "align BillManagement layout with MenuManagement UI")

### What Kawinthida changed
- Header wrapping (removed `.bm-title-wrap` + `.bm-title-bar`, added `.bm-subtitle`)
- Removed emoji from custom tab button
- Minor CSS realign

### Backend wiring
- Reuse existing wiring (listOrders + getOrder + getPayment) — copy layout only
- Preserve backend-driven state (from my earlier B02 port)

### Acceptance
- Copy Kawinthida's JSX structure/className verbatim
- Data source stays backend (bills state + activeDetail hook)

---

## 🎫 K03 — Wire AddUserPage → createUser API + route + admin nav entry

- **Type:** Backend Wiring
- **Priority:** High
- **Source (UI existing):** [`code/frontend/src/pages/AddUserPage.jsx`](file:///Users/minitinny/School%20Dev/CafePosSystem/code/frontend/src/pages/AddUserPage.jsx) (Kanyawee, 202 lines)
- **Target file:** `AddUserPage.jsx` (handler only) + `App.jsx` (route) + `PosScreen.jsx` (nav)

### Current state
- Kanyawee ทำ form UI ครบ แต่ `handleSubmit` เพียง `console.log` — ไม่ทำอะไร
- ไม่มี route ใน App.jsx (`/pos` + `/login` เท่านั้น)
- ไม่มี entry point ใน PosScreen sidebar

### Backend contract
- `POST /users` body: `CreateUserRequest { username, password, role: 'ADMIN'|'CASHIER', fullName, phone, email }`
- 403 if not ADMIN, 409 if username duplicate

### Acceptance
- `handleSubmit` → เรียก `createUser` + validate + error handling + navigate('/pos') on success
- App.jsx เพิ่ม `<Route path="/add-user">` behind `RequireAuth`
- PosScreen sidebar เพิ่ม nav "เพิ่มผู้ใช้" (admin only) → `navigate('/add-user')` — **แต่ห้ามเตะ UI ที่มีอยู่** ให้เพิ่มเป็น footer nav entry เท่านั้น

---

## 🎫 K04 — Apply stashed B07 getMe refresh (session sync)

- **Type:** Bugfix (Session Consistency)
- **Priority:** Low
- **Files:** `code/frontend/src/auth/AuthProvider.jsx`

### Description
งานที่ stash ไว้: เพิ่ม `getMe()` call ตอน AuthProvider mount + window focus เพื่อ sync user data ล่าสุด (ถ้า admin แก้ role หลัง login → cache localStorage ล้าสมัย)

### Acceptance
- Apply stash content (functional setSession + persist to localStorage)
- ไม่แตะ UI

---

## Execution Order

1. **K01** — port AddonManagementView + wire (highest impact, replace my broken B06 attempt)
2. **K02** — sync BillManagement layout (small, low-risk)
3. **K03** — wire AddUserPage (adds real feature)
4. **K04** — apply B07 stash (background)
