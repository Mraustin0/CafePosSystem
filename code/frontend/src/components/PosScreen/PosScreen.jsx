import { useState, useEffect, useCallback } from "react";
import "./PosScreen.css";
import { AddNewItemModal } from "./AddNewItemModal";
import { listProducts, createProduct } from "../../api/products";
import { getCategories } from "../../api/categories";

// Nav key -> backend category name (must match seed data in V2__seed_demo_data.sql)
const NAV_TO_CATEGORY_NAME = { coffee: "Coffee", tea: "Tea", snack: "Bakery" };

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
  { key: "milk", label: "เมนูนม", icon: Icon.Milk },
  { key: "snack", label: "ขนม", icon: Icon.Snack },
  { key: "promo", label: "โปรโมชั่น", icon: Icon.Tag },
];

const NAV_FOOTER = [
  { key: "dashboard", label: "Dashboard", icon: Icon.Grid },
  { key: "settings", label: "ตั้งค่า", icon: Icon.Gear },
];

const INITIAL_MENU = [
  { id: 1, name: "ESPRESSO SHOT", price: 55, qty: 2, image: true, kind: "espresso" },
  { id: 2, name: "ICED AMERICANO", price: 55, qty: 1, image: true, kind: "americano" },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 3,
    name: "ชื่อเมนู",
    price: null,
    qty: i % 2 === 0 ? 2 : 1,
    image: false,
  })),
];

const INITIAL_CART = [
  {
    id: 101,
    name: "คาปูซิโน่ / Cappuccino",
    isNew: true,
    price: 9.75,
    qty: 1,
    detail: "เย็น (Iced) • หัวกลาง • หวาน 100%",
    extras: "+ เพิ่มช็อตกาแฟ (+Extra Shot), + วิปครีม",
    note: "โน้ต: แยกน้ำแข็ง",
  },
];

export default function PosScreen() {
  const [activeNav, setActiveNav] = useState("coffee");
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [cart, setCart] = useState(INITIAL_CART);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const page = await listProducts({ active: true, size: 100 });
      const items = (page?.content ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price != null ? Number(p.price) : null,
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
  const visibleMenu = currentCategoryName
    ? menu.filter((m) => m.categoryName === currentCategoryName || m.categoryName == null)
    : menu;

  const handleAddSubmit = async ({ name, price }) => {
    const categoryName = NAV_TO_CATEGORY_NAME[activeNav];
    if (!categoryName) throw new Error(`หมวด "${activeNav}" ยังไม่ผูกกับ backend`);
    const category = categories.find((c) => c.name === categoryName);
    if (!category) throw new Error(`ไม่พบหมวด "${categoryName}" ในฐานข้อมูล`);
    await createProduct({ categoryId: category.id, name, price, imageUrl: null, addOnIds: [] });
    await loadProducts();
  };

  const changeMenuQty = (id, delta) => {
    setMenu((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    );
  };

  const changeCartQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeCartItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const itemCount = cart.length;
  const quantityCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="pos">
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
        {/* Header */}
        <header className="pos-header">
          <div className="pos-brand">
            <div className="pos-brand__logo">WP</div>
            <div>
              <div className="pos-brand__title">WongNok POS Studio</div>
              <div className="pos-brand__subtitle">สาขาหลัก • Terminal 01</div>
            </div>
          </div>

          <div className="pos-search">
            <Icon.Search className="pos-search__icon" />
            <input type="text" placeholder="ค้นหาเมนู (Search menu)..." />
          </div>

          <div className="pos-cashier">
            <div className="pos-cashier__text">
              <div className="pos-cashier__name">แคชเชียร์ 01</div>
              <div className="pos-cashier__status">
                <span className="pos-dot pos-dot--online" />
                ออนไลน์
              </div>
            </div>
            <div className="pos-cashier__avatar">
              <Icon.User />
            </div>
            <Icon.Chevron className="pos-cashier__chevron" />
          </div>
        </header>

        {/* Body: menu grid + order panel */}
        <div className="pos-body">
          {/* -------- Menu grid -------- */}
          <section className="pos-menu">
            <div className="pos-menu__head">
              <h2>
                หมวดกาแฟ <span className="pos-skeleton pos-skeleton--label" />
              </h2>
              <div className="pos-menu__actions">
                <button className="pos-btn pos-btn--ghost-danger">
                  <Icon.Trash />
                  ลบเมนู
                </button>
                <button className="pos-btn pos-btn--solid" onClick={() => setShowAddModal(true)}
                        disabled={!NAV_TO_CATEGORY_NAME[activeNav]}
                        title={NAV_TO_CATEGORY_NAME[activeNav] ? "" : `หมวด ${activeNav} ยังไม่ผูก backend`}>
                  <Icon.Plus />
                  เพิ่มเมนู
                </button>
              </div>
            </div>

            {loadError && <p style={{ color: "#c0392b", padding: "0 24px" }}>{loadError}</p>}
            <div className="pos-menu__grid">
              {visibleMenu.map((item) => (
                <article className="pos-card" key={item.id}>
                  <div className={`pos-card__image ${item.kind ? `is-${item.kind}` : ""}`}>
                    {item.kind === "espresso" && <div className="pos-cup" />}
                  </div>
                  <div className="pos-card__body">
                    {item.price !== null ? (
                      <h3>{item.name}</h3>
                    ) : (
                      <h3 className="pos-skeleton pos-skeleton--title" />
                    )}

                    <div className="pos-card__row">
                      <div className="pos-card__price">
                        <span className="pos-card__pricelabel">ราคา</span>
                        {item.price !== null ? (
                          <span className="pos-card__pricevalue">฿ {item.price}</span>
                        ) : (
                          <span className="pos-skeleton pos-skeleton--price" />
                        )}
                      </div>

                      <div className="pos-stepper">
                        <button onClick={() => changeMenuQty(item.id, -1)} aria-label="ลดจำนวน">
                          <Icon.Minus />
                        </button>
                        <span className={item.qty > 1 ? "is-active" : ""}>{item.qty}</span>
                        <button onClick={() => changeMenuQty(item.id, 1)} aria-label="เพิ่มจำนวน">
                          <Icon.Plus />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* -------- Order / invoice panel -------- */}
          <aside className="pos-order">
            <div className="pos-order__meta">
              <div>
                <div className="pos-order__invoice">Invoice No: 123454</div>
              </div>
              <div className="pos-order__date">23/01/2024 | 14:00:23</div>
            </div>

            <div className="pos-order__shop">
              <div className="pos-order__shoplogo">WP</div>
              <div className="pos-order__shopinfo">
                <div className="pos-order__shopname">WongNok POS</div>
                <div className="pos-order__shopemail">easypos@gmail.com</div>
              </div>
              <div className="pos-pill">Order: #0029</div>
            </div>

            <div className="pos-order__items">
              {cart.map((item) => (
                <div className="pos-orderitem" key={item.id}>
                  <div className="pos-orderitem__icon">
                    <Icon.Coffee />
                  </div>
                  <div className="pos-orderitem__body">
                    <div className="pos-orderitem__row">
                      <div className="pos-orderitem__name">
                        {item.name}
                        {item.isNew && <span className="pos-badge">ใหม่</span>}
                      </div>
                      <div className="pos-orderitem__price">${item.price.toFixed(2)}</div>
                    </div>
                    <div className="pos-orderitem__detail">{item.detail}</div>
                    <div className="pos-orderitem__extras">{item.extras}</div>
                    {item.note && <div className="pos-orderitem__note">{item.note}</div>}

                    <div className="pos-orderitem__footer">
                      <div className="pos-stepper pos-stepper--panel">
                        <button onClick={() => changeCartQty(item.id, -1)} aria-label="ลดจำนวน">
                          <Icon.Minus />
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => changeCartQty(item.id, 1)} aria-label="เพิ่มจำนวน">
                          <Icon.Plus />
                        </button>
                      </div>
                      <button className="pos-iconbtn" onClick={() => removeCartItem(item.id)} aria-label="ลบรายการ">
                        <Icon.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="pos-order__empty">ยังไม่มีรายการสั่งซื้อ</div>}
            </div>

            <div className="pos-promo">
              <div className="pos-promo__head">
                <Icon.Tag className="pos-promo__icon" />
                <span>โปรโมชั่น (Promotion)</span>
                <span className="pos-pill pos-pill--green">ประหยัด ฿8.68</span>
              </div>
              <div className="pos-promo__row">
                <div className="pos-promo__label">
                  <span className="pos-dot pos-dot--green" />
                  ส่วนลด Member 10%
                </div>
                <div className="pos-promo__value">-$8.68</div>
              </div>
              <div className="pos-promo__row pos-promo__row--sub">
                <span>โค้ด: MEMBER10</span>
                <button className="pos-linkbtn">ยกเลิกส่วนลด</button>
              </div>
            </div>

            <div className="pos-total">
              <div>
                <div className="pos-total__label">Total</div>
                <div className="pos-total__meta">
                  Items: {itemCount}, Quantity: {quantityCount}
                </div>
              </div>
              <div className="pos-total__value">$86.75</div>
            </div>

            <div className="pos-order__buttons">
              <button className="pos-btn pos-btn--outline">
                <Icon.Print />
                Print Invoice
              </button>
              <button className="pos-btn pos-btn--solid pos-btn--full">
                <Icon.Card />
                Payments
              </button>
            </div>
          </aside>
        </div>
      </div>
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
