import { useState, useEffect, useCallback, useMemo } from "react";
import "./PosScreen.css";
import { AddNewItemModal } from "./AddNewItemModal";
import { AddPromotionModal } from "./AddPromotionModal";
import CoffeeModal from "./CoffeeModal";
import TeaModal from "./TeaModal";
import PromotionView from "./PromotionView";
import { listProducts, createProduct } from "../../api/products";
import { getCategories } from "../../api/categories";
import { createPromotion, updatePromotion } from "../../api/promotions";
import { useAuth } from "../../auth/useAuth";

// Nav key -> backend category name (must match seed data in V2__seed_demo_data.sql)
const NAV_TO_CATEGORY_NAME = { coffee: "Coffee", tea: "Tea", snack: "Bakery" };
const CATEGORY_HEADING = { coffee: "หมวดกาแฟ", tea: "หมวดชา", snack: "หมวดขนม", milk: "เมนูนม", promo: "โปรโมชั่น" };

/* ---------------------------------------------------------
   Icons — small inline SVGs, no external icon library needed
--------------------------------------------------------- */
const Icon = {
  Coffee: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M4 9h13a3 3 0 0 1 0 6h-1" strokeLinecap="round" />
      <path d="M4 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 4c-.6.8-.6 1.4 0 2M10 4c-.6.8-.6 1.4 0 2" strokeLinecap="round" />
    </svg>
  ),
  Tea: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M4 9h14a3 3 0 0 1 0 6h-1" strokeLinecap="round" />
      <path d="M4 9v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3c-1 1-1 2 0 3M12 3c-1 1-1 2 0 3" strokeLinecap="round" />
    </svg>
  ),
  Milk: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M9 3h6l1 4-2 2v10a2 2 0 0 1-2 2h-0a2 2 0 0 1-2-2V9L8 7z" strokeLinejoin="round" />
    </svg>
  ),
  Snack: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="4" y="10" width="16" height="9" rx="2" />
      <path d="M4 10 12 4l8 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Tag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M11 3h6a2 2 0 0 1 2 2v6l-9 9-8-8z" strokeLinejoin="round" />
      <circle cx="15.5" cy="7.5" r="1.2" />
    </svg>
  ),
  Grid: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Gear: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z" strokeLinejoin="round" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.4-3.6 4.3-5.4 7-5.4s5.6 1.8 7 5.4" strokeLinecap="round" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  Minus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  Print: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" strokeLinejoin="round" />
    </svg>
  ),
  Card: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19" />
    </svg>
  ),
};

/* ---------------------------------------------------------
   Static data — in the real project this comes from the API
--------------------------------------------------------- */
const NAV_ITEMS = [
  { key: "coffee", label: "กาแฟ", icon: Icon.Coffee },
  { key: "tea", label: "ชา", icon: Icon.Tea },
  { key: "snack", label: "ขนม", icon: Icon.Snack },
  { key: "promo", label: "โปรโมชั่น", icon: Icon.Tag },
];

const NAV_FOOTER = [
  { key: "dashboard", label: "Dashboard", icon: Icon.Grid },
  { key: "settings", label: "ตั้งค่า", icon: Icon.Gear },
];

export default function PosScreen() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState("coffee");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [selectedTeaForModal, setSelectedTeaForModal] = useState(null);
  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [searchText, setSearchText] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const page = await listProducts({ active: true, size: 100 });
      const items = (page?.content ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price != null ? Number(p.price) : 0,
        qty: 1,
        image: !!p.imageUrl,
        categoryId: p.category?.id ?? null,
        categoryName: p.category?.name ?? null,
      }));
      setMenu(items);
    } catch (err) {
      setLoadError(err?.message ?? "โหลดเมนูไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    loadProducts();
  }, [loadProducts]);

  const currentCategoryName = NAV_TO_CATEGORY_NAME[activeNav];
  const search = searchText.trim().toLowerCase();
  const visibleMenu = currentCategoryName
    ? menu.filter((m) => m.categoryName === currentCategoryName && (!search || m.name.toLowerCase().includes(search)))
    : [];

  const handleAddSubmit = async ({ name, price }) => {
    const categoryName = NAV_TO_CATEGORY_NAME[activeNav];
    if (!categoryName) throw new Error(`หมวด "${activeNav}" ยังไม่ผูกกับ backend`);

    // Refetch categories if initial silent-fetch failed (e.g. Render cold start).
    let cats = categories;
    if (!cats || cats.length === 0) {
      try {
        cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("getCategories failed:", err);
        throw new Error(`โหลดหมวดหมู่ไม่สำเร็จ (${err?.status ?? "no status"}): ${err?.message ?? err}`);
      }
    }

    const category = cats.find((c) => c.name === categoryName);
    if (!category) {
      throw new Error(`ไม่พบหมวด "${categoryName}" ใน DB — มี: ${cats.map((c) => c.name).join(", ") || "(ว่าง)"}`);
    }

    try {
      await createProduct({ categoryId: category.id, name, price, imageUrl: null, addOnIds: [] });
    } catch (err) {
      console.error("createProduct failed:", err);
      if (err?.status === 403) throw new Error("ไม่มีสิทธิ์เพิ่มเมนู — ต้อง login เป็น ADMIN (admin/cafe1234)");
      if (err?.status === 401) throw new Error("Session หมดอายุ — logout แล้ว login ใหม่");
      if (err?.status === 409) throw new Error(`ชื่อเมนูซ้ำ: "${name}"`);
      throw new Error(`บันทึกไม่สำเร็จ (${err?.status ?? "no status"}): ${err?.message ?? err}`);
    }
    await loadProducts();
  };

  const addCustomizedToCart = (customized) => {
    setCart((prev) => [...prev, { ...customized, cartId: Date.now() + Math.random() }]);
  };
  const changeCartQty = (cartId, delta) => {
    setCart((prev) => prev.map((item) => item.cartId === cartId ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };
  const removeCartItem = (cartId) => setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  const changeMenuQty = (id, delta) => {
    setMenu((prev) => prev.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item));
  };
  const openItemModal = (item) => {
    if (activeNav === "tea") setSelectedTeaForModal(item);
    else setSelectedItemForModal(item);
  };
  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const memberDiscount = subtotal * 0.10; // ponytail: visual placeholder, wire to applyDiscount API later
  const total = subtotal - memberDiscount;
  const itemCount = cart.length;
  const quantityCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const invoiceNo = useMemo(() => Math.floor(100000 + Math.random() * 900000), []);
  const orderNo = useMemo(() => String(Math.floor(1 + Math.random() * 999)).padStart(4, "0"), []);

  const now = new Date();
  const dateStr = now.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" });
  const cashierName = user?.fullName || user?.username || "แคชเชียร์";

  return (
    <div className="pos">
      {/* ---------------- Header (full width, above sidebar+main) ---------------- */}
      <header className="pos-header">
        <div className="pos-brand">
          <div className="pos-brand__logo">WP</div>
          <div>
            <div className="pos-brand__title">WongNok POS Studio</div>
            <div className="pos-brand__subtitle">สาขาหลัก • Terminal 01</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="pos-cashier">
          <div className="pos-cashier__text">
            <div className="pos-cashier__name">{cashierName}</div>
            <div className="pos-cashier__status">
              <span className="pos-dot pos-dot--online" />
              {user?.role === "ADMIN" ? "แอดมิน" : "แคชเชียร์"} • ออนไลน์
            </div>
          </div>
          <div className="pos-cashier__avatar">
            <Icon.User />
          </div>
          <Icon.Chevron className="pos-cashier__chevron" />
        </div>
      </header>

      <div className="pos-content">
        {/* ---------------- Sidebar ---------------- */}
        <aside className="pos-sidebar">
          <nav className="pos-sidebar__nav">
            {NAV_ITEMS.map(({ key, label, icon: ItemIcon }) => (
              <button
                key={key}
                className={`pos-navitem ${activeNav === key ? "is-active" : ""}`}
                onClick={() => setActiveNav(key)}
              >
                <ItemIcon className="pos-navitem__icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <nav className="pos-sidebar__footer">
            {NAV_FOOTER.map(({ key, label, icon: ItemIcon }) => (
              <button key={key} className="pos-navitem pos-navitem--muted">
                <ItemIcon className="pos-navitem__icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ---------------- Main column ---------------- */}
        <div className="pos-main">
          {/* Body: menu grid + order panel */}
          <div className="pos-body">
          {activeNav === "promo" ? (
            <PromotionView
              onOpenAddPromoModal={() => { setEditingPromo(null); setIsAddPromoModalOpen(true); }}
              onEditPromo={(promo) => { setEditingPromo(promo); setIsAddPromoModalOpen(true); }}
            />
          ) : (
          <>
          {/* -------- Menu grid -------- */}
          <section className="pos-menu">
            <div className="pos-menu__head">
              <h2>
                {CATEGORY_HEADING[activeNav] ?? activeNav} <span className="pos-skeleton pos-skeleton--label" />
              </h2>
              <div className="pos-search pos-search--inline" style={{ marginLeft: "auto", marginRight: 0, flex: "0 1 320px" }}>
                <Icon.Search className="pos-search__icon" />
                <input type="text" placeholder="ค้นหาเมนู (Search menu)..."
                       value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              </div>
            </div>

            {loadError && <p style={{ color: "#c0392b", padding: "0 24px" }}>{loadError}</p>}
            <div className="pos-menu__grid">
              {NAV_TO_CATEGORY_NAME[activeNav] && (
                <article className="pos-card pos-card--add" onClick={() => setShowAddModal(true)}>
                  <div className="pos-card__add-content">
                    <div className="pos-card__add-icon"><Icon.Plus /></div>
                    <span className="pos-card__add-text">เพิ่มเมนูใหม่</span>
                    <span className="pos-card__add-subtext">(คลิกเพื่อเปิดฟอร์ม)</span>
                  </div>
                </article>
              )}
              {visibleMenu.length === 0 && !loadError && (
                <div style={{ padding: 32, color: "#888", gridColumn: "1 / -1", textAlign: "center" }}>
                  {NAV_TO_CATEGORY_NAME[activeNav]
                    ? "ยังไม่มีเมนูในหมวดนี้ — กดการ์ด \"เพิ่มเมนูใหม่\" เพื่อสร้าง"
                    : `หมวด "${activeNav}" ยังไม่ผูกกับ backend`}
                </div>
              )}
              {visibleMenu.map((item) => {
                const kind = item.name.match(/espresso/i) ? "espresso"
                            : item.name.match(/americano/i) ? "americano" : "";
                return (
                  <article className="pos-card" key={item.id}>
                    <div className={`pos-card__image ${kind ? `is-${kind}` : ""}`}>
                      {kind === "espresso" && <div className="pos-cup" />}
                    </div>
                    <div className="pos-card__body">
                      <h3>{item.name}</h3>
                      <div className="pos-card__row">
                        <div className="pos-card__price">
                          <span className="pos-card__pricelabel">ราคา</span>
                          <span className="pos-card__pricevalue">฿ {item.price.toFixed(2)}</span>
                        </div>
                        <div className="pos-stepper">
                          <button onClick={() => changeMenuQty(item.id, -1)} aria-label="ลดจำนวน">
                            <Icon.Minus />
                          </button>
                          <span className={item.qty > 0 ? "is-active" : ""}>{item.qty}</span>
                          <button onClick={() => openItemModal(item)} aria-label="เพิ่มลงตะกร้า">
                            <Icon.Plus />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* -------- Order / invoice panel -------- */}
          <aside className="pos-order">
            <div className="pos-order__meta">
              <div>
                <div className="pos-order__invoice">Invoice No: {invoiceNo}</div>
              </div>
              <div className="pos-order__date">{dateStr}</div>
            </div>

            <div className="pos-order__shop">
              <div className="pos-order__shoplogo">WP</div>
              <div className="pos-order__shopinfo">
                <div className="pos-order__shopname">WongNok POS</div>
                <div className="pos-order__shopemail">easypos@gmail.com</div>
              </div>
              <div className="pos-pill">Order: #{orderNo}</div>
            </div>

            <div className="pos-order__items">
              {cart.length === 0 && <div className="pos-order__empty">ยังไม่มีรายการ — กด + บนเมนูเพื่อเปิดฟอร์ม</div>}
              {cart.map((item) => (
                <div className="pos-orderitem" key={item.cartId}>
                  <div className="pos-orderitem__icon"><Icon.Coffee /></div>
                  <div className="pos-orderitem__body">
                    <div className="pos-orderitem__row">
                      <div className="pos-orderitem__name">
                        {item.name}
                        {item.isNew && <span className="pos-badge">ใหม่</span>}
                      </div>
                      <div className="pos-orderitem__price">฿{(item.price * item.qty).toFixed(2)}</div>
                    </div>
                    {item.detail && <div className="pos-orderitem__detail">{item.detail}</div>}
                    {item.extras && <div className="pos-orderitem__extras">{item.extras}</div>}
                    {item.note && <div className="pos-orderitem__note">{item.note}</div>}
                    <div className="pos-orderitem__footer">
                      <div className="pos-stepper pos-stepper--panel">
                        <button onClick={() => changeCartQty(item.cartId, -1)} aria-label="ลดจำนวน">
                          <Icon.Minus />
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => changeCartQty(item.cartId, 1)} aria-label="เพิ่มจำนวน">
                          <Icon.Plus />
                        </button>
                      </div>
                      <button className="pos-iconbtn" onClick={() => removeCartItem(item.cartId)} aria-label="ลบรายการ">
                        <Icon.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="pos-promo">
                <div className="pos-promo__head">
                  <Icon.Tag className="pos-promo__icon" />
                  <span>โปรโมชั่น (Promotion)</span>
                  <span className="pos-pill pos-pill--green">ประหยัด ฿{memberDiscount.toFixed(2)}</span>
                </div>
                <div className="pos-promo__row">
                  <div className="pos-promo__label">
                    <span className="pos-dot pos-dot--green" />
                    ส่วนลด Member 10%
                  </div>
                  <div className="pos-promo__value">-฿{memberDiscount.toFixed(2)}</div>
                </div>
                <div className="pos-promo__row pos-promo__row--sub">
                  <span>โค้ด: MEMBER10</span>
                  <button className="pos-linkbtn" disabled title="ยังไม่เชื่อม applyDiscount API">ยกเลิกส่วนลด</button>
                </div>
              </div>
            )}

            <div className="pos-total">
              <div>
                <div className="pos-total__label">Total</div>
                <div className="pos-total__meta">
                  Items: {itemCount}, Quantity: {quantityCount}
                </div>
              </div>
              <div className="pos-total__value">฿{total.toFixed(2)}</div>
            </div>

            <div className="pos-order__buttons">
              <button className="pos-btn pos-btn--outline" disabled title="ยังไม่พร้อม — จะทำหลังชำระเงินได้">
                <Icon.Print />
                Print Invoice
              </button>
              <button className="pos-btn pos-btn--solid pos-btn--full" disabled={cart.length === 0}
                      title={cart.length === 0 ? "ตะกร้าว่าง" : "ยังไม่เชื่อมกับ API ชำระเงิน"}>
                <Icon.Card />
                Payments
              </button>
            </div>
          </aside>
          </>
          )}
        </div>
        </div>
      </div>
      {isAddPromoModalOpen && (
        <AddPromotionModal
          initial={editingPromo}
          onClose={() => { setIsAddPromoModalOpen(false); setEditingPromo(null); }}
          onSubmit={async (form) => {
            const body = {
              code: form.code,
              name: form.name,
              discountType: form.discountType,
              discountValue: form.discountValue,
              minOrderAmount: form.minOrderAmount,
              active: form.active,
            };
            try {
              if (form.id) await updatePromotion(form.id, body);
              else await createPromotion(body);
              window.dispatchEvent(new Event("promotions:reload"));
            } catch (err) {
              console.error("save promotion failed:", err);
              if (err?.status === 403) throw new Error("ต้อง login เป็น ADMIN");
              if (err?.status === 409) throw new Error(`โค้ดซ้ำ: "${form.code}"`);
              throw new Error(`บันทึกไม่สำเร็จ (${err?.status ?? "no status"}): ${err?.message ?? err}`);
            }
          }}
        />
      )}
      {selectedItemForModal && (
        <CoffeeModal
          item={selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          onAddToCart={(customized) => addCustomizedToCart(customized)}
        />
      )}
      {selectedTeaForModal && (
        <TeaModal
          item={selectedTeaForModal}
          onClose={() => setSelectedTeaForModal(null)}
          onAddToCart={(customized) => addCustomizedToCart(customized)}
        />
      )}
      {showAddModal && (
        <AddNewItemModal
          activeCategory={activeNav}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}
    </div>
  );
}
