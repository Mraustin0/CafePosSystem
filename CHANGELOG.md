# Changelog

All notable changes to the Cafe POS System will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1] — 2026-10-01

First production release — MVP cafe POS covering the cashier flow end-to-end plus admin management for menu, add-ons, promotions, bills, dashboard reports, and user creation.

### Added — Core POS

- **Authentication** — JWT login (`POST /auth/login`) with session persisted in `localStorage` and auto-refresh via `GET /users/me` on boot + window focus
- **Menu browse** — category-filtered grid (coffee / tea / snack) with per-item customization modals (CoffeeModal with roast + sweetness + serving + add-ons; TeaModal with sweetness + add-ons)
- **Cart + checkout** — add/remove/qty with inline total; promotion select (`SelectPromotionModal`) applies backend discount (`PUT /orders/{id}/discount`); checkout opens `PaymentModal`
- **PaymentModal** — split-screen full-screen flow (cash / PromptPay) with quick-amount buttons, change calculation, and promotion/discount summary that matches the backend-authoritative total
- **PaymentSuccessModal** — animated success screen with thermal receipt preview and print window

### Added — Admin

- **MenuManagementView** — list + search + status filter (active/inactive), create via `AddNewItemModal`, edit name/price/add-on associations via `MenuConfigModal`, soft-delete via `PATCH /products/{id}/status`
- **AddonManagementView** — CRUD + category filter + edit/delete modals (soft-delete via `setAddOnStatus(false)`)
- **PromotionView** — list + search (title + code) + status filter + CRUD + toggle; `SelectPromotionModal` surfaces eligibility (min-order amount) during checkout
- **BillManagementView** — paid order history with date tabs (today / week / month / custom), payment-method + sort filters, right-pane receipt view that hydrates items via `getOrder` and payment metadata via `getPayment`, refresh button
- **DashboardView** — sales summary (gross, discount, net), top 10 products, sales by cashier (ADMIN-only), sales by payment method; date tabs drive the range on all 4 report endpoints
- **AddUserPage** — admin-only form that creates `CASHIER` or `ADMIN` users via `POST /users`

### Added — Backend integration (28 of 51 endpoints wired, 55%)

Breakdown by module:

- `auth` — `login`
- `users` — `getMe`, `createUser`
- `products` — `listProducts`, `createProduct`, `updateProduct`, `setProductStatus`
- `categories` — `getCategories`
- `add-ons` — `listAddOns`, `createAddOn`, `updateAddOn`, `setAddOnStatus`
- `orders` — `createOrder`, `applyDiscount`, `listOrders`, `getOrder`
- `payment` — `payOrder`, `getPayment`
- `promotions` — `listPromotions`, `createPromotion`, `updatePromotion`, `setPromotionStatus`, `deletePromotion`
- `reports` — `salesSummary`, `topProducts`, `salesByCashier`, `salesByPaymentMethod`

### Fixed — Payment flow (tickets P01–P10, `doc/BUG_TICKETS_PAYMENT.md`)

- **P01/P02** — PaymentModal accepts `subtotal` + `discountAmount` + `promoName` props so QR/CARD `amountReceived` equals the backend-computed `order.total` (previously overpaid under promotion)
- **P04** — Cached `pendingOrder` on checkout retry; payment failure no longer creates duplicate PENDING orders
- **P05** — Explicit `METHOD_MAP` fails loud on unknown payment methods (was silently defaulting to CASH)
- **P06** — Receipt uses backend-authoritative `payment.change` instead of client-side float math
- **P07** — Receipt uses `order.orderNumber` instead of hardcoded `A-108`
- **P09** — Receipt shows cashier from the auth session
- **P10** — `amountReceived.toFixed(2)` before send to match backend `BigDecimal` `HALF_UP` scale

### Fixed — UI integration regressions

- Product-addon associations now persist to the backend (`handleSaveMenuConfig` sends `addOnIds` + `categoryId`)
- Payments button no longer uses `window.prompt`; replaced with `PaymentModal` flow
- Cart item line-price uses `item.price * item.qty` (previously showed per-unit)
- Search inputs wired on PosScreen main menu, MenuManagementView, PromotionView (previously decorative)
- Modal `activeAddons` filter now receives the full product customization config (serving/roast/sweetness/addonIds); previously only `addonIds` reached the modal

### Changed — UI

- All POS UI ported verbatim from `pos-demo/` reference (Thana-nan / Kawinthida / Kanyawee contributions)
- Tailwind preflight disabled to avoid resetting the pos-demo baseline styles
- `pos-search--inline` pinned to `height: 40px` + `flex: 0 0 auto` so the search bar doesn't stretch with the two-line heading
- Removed hardcoded "Easy POS Studio" shop block from the order panel
- Removed Print Invoice button from checkout footer (matches Thana-nan's latest design)
- Replaced cart item coffee icon with `{qty}x` green badge
- Added `custom-*` CSS classes (`custom-cart-icon`, `custom-stepper`, `custom-payment-btn`, `custom-total-value`, etc.) matching pos-demo exactly

### Known Limitations

Tracked in `doc/BACKEND_INTEGRATION_AUDIT.md`, `doc/BUG_TICKETS_PR28.md`, `doc/BUG_TICKETS_PR32-33.md`, `doc/BUG_TICKETS_PAYMENT.md`:

- **B03 User management (partial)** — Admin can create new users (AddUserPage) but cannot list / toggle / edit existing users or change their own profile / password (6 endpoints unwired)
- **B05 Category CRUD** — Coffee / Tea / Bakery hardcoded in nav; admin cannot add / rename / delete categories (4 endpoints unwired)
- **B08/B09 Order edit / cancel** — No UI to replace order items or cancel PENDING orders stuck from failed payments (2 endpoints unwired)
- **P03 CARD payment method** — Backend accepts `CARD` but PaymentModal UI only exposes cash + PromptPay
- **P08 VAT display** — PaymentModal shows an estimated 7% VAT line; backend doesn't persist VAT separately

### Team

- **Phakawat** — Backend integration + all frontend wiring + payment ticket cleanup
- **Thana-nan** — POS UI (CoffeeModal, TeaModal, PaymentModal, PaymentSuccessModal, cart layout)
- **Kanyawee** — LoginPage + AddUserPage
- **Kawinthida** — BillManagementView + AddonManagementView (edit/delete modals)
