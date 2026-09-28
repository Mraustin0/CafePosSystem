import React, { useState } from "react";
import "./PosScreen.css";

import CoffeeModal from "./CoffeeModal"; 
import TeaModal from "./TeaModal";
import { AddNewItemModal } from "./AddNewItemModal";
import PromotionView from "./PromotionView";
import { AddPromotionModal } from "./AddPromotionModal";
import MenuManagementView from "./MenuManagementView";
import { SelectPromotionModal } from "./SelectPromotionModal";
import MenuConfigModal  from "./MenuConfigModal";
import AddonManagementView from "./AddonManagementView"; 

/* ---------------------------------------------------------
   Icons
--------------------------------------------------------- */
const Icon = {
  Coffee: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 9h13a3 3 0 0 1 0 6h-1" strokeLinecap="round" /><path d="M4 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 4c-.6.8-.6 1.4 0 2M10 4c-.6.8-.6 1.4 0 2" strokeLinecap="round" /></svg>,
  Tea: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 9h14a3 3 0 0 1 0 6h-1" strokeLinecap="round" /><path d="M4 9v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 3c-1 1-1 2 0 3M12 3c-1 1-1 2 0 3" strokeLinecap="round" /></svg>,
  Milk: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M9 3h6l1 4-2 2v10a2 2 0 0 1-2 2h-0a2 2 0 0 1-2-2V9L8 7z" strokeLinejoin="round" /></svg>,
  Snack: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="4" y="10" width="16" height="9" rx="2" /><path d="M4 10 12 4l8 6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Tag: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M11 3h6a2 2 0 0 1 2 2v6l-9 9-8-8z" strokeLinejoin="round" /><circle cx="15.5" cy="7.5" r="1.2" /></svg>,
  Grid: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  Layers: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>,
  Gear: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z" strokeLinejoin="round" /></svg>,
  Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>,
  Chevron: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  User: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.4-3.6 4.3-5.4 7-5.4s5.6 1.8 7 5.4" strokeLinecap="round" /></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>,
  Minus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}><path d="M5 12h14" strokeLinecap="round" /></svg>,
  Print: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" strokeLinejoin="round" /></svg>,
  Card: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19" /></svg>,
  Edit: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const NAV_ITEMS = [
  { key: "coffee", label: "กาแฟ", icon: Icon.Coffee },
  { key: "tea", label: "ชา", icon: Icon.Tea },
  { key: "snack", label: "ขนม", icon: Icon.Snack },
];

const NAV_FOOTER = [
  { key: "manage", label: "จัดการเมนู", icon: Icon.Edit },
  { key: "manage_addon", label: "จัดการท็อปปิ้ง", icon: Icon.Layers }, 
  { key: "promo", label: "โปรโมชั่น", icon: Icon.Tag },
  { key: "dashboard", label: "Dashboard", icon: Icon.Grid },
];

const INITIAL_MENU = [
  { id: 1, category: "coffee", name: "ESPRESSO SHOT", price: 55, qty: 0, stock: null, config: null, isActive: true, imgSrc: "https://placehold.co/400x300/e2e8f0/64748b?text=Espresso", kind: "espresso" },
  { id: 2, category: "coffee", name: "ICED AMERICANO", price: 55, qty: 0, stock: null, config: null, isActive: true, imgSrc: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop", kind: "americano" },
  { id: 3, category: "tea", name: "ชาไทยพรีเมียม", price: 65, qty: 0, stock: null, config: null, isActive: true, imgSrc: "https://placehold.co/400x300/fed7aa/c2410c?text=Thai+Tea", kind: "tea" },
  { id: 4, category: "tea", name: "ชาเขียวมัทฉะ", price: 75, qty: 0, stock: null, config: null, isActive: true, imgSrc: "https://placehold.co/400x300/bbf7d0/15803d?text=Matcha", kind: "tea" },
  { id: 5, category: "snack", name: "คุกกี้ช็อกโกแลต", price: 45, qty: 0, stock: 5, config: null, isActive: true, imgSrc: "https://placehold.co/400x300/fef08a/a16207?text=Cookie", kind: "snack" },
  { id: 6, category: "snack", name: "ครัวซองต์เนยสด", price: 65, qty: 0, stock: 0, config: null, isActive: true, imgSrc: "https://placehold.co/400x300/fef08a/a16207?text=Croissant", kind: "snack" },
];

const INITIAL_CART = []; 

const INITIAL_GLOBAL_ADDONS = [
  { id: 'shot', label: 'เพิ่มช็อตกาแฟ', desc: '+Extra Shot', price: 20, isActive: true, category: 'coffee' },
  { id: 'whip', label: 'วิปครีม', desc: '+Whipped Cream', price: 15, isActive: true, category: 'all' },
  { id: 'boba', label: 'ไข่มุก', desc: '+Tapioca Pearls', price: 10, isActive: true, category: 'tea' },
  { id: 'jelly', label: 'บุกบราวน์ชูการ์', desc: '+Brown Sugar Jelly', price: 15, isActive: true, category: 'tea' },
  { id: 'pudding', label: 'พุดดิ้งไข่', desc: '+Egg Pudding', price: 15, isActive: true, category: 'tea' },
  { id: 'oatmilk', label: 'นมโอ๊ต', desc: '+Oat Milk', price: 15, isActive: true, category: 'all' },
  { id: 'vanilla', label: 'วานิลลาไซรัป', desc: '+Vanilla Syrup', price: 15, isActive: false, category: 'coffee' }
];

export default function PosScreen() {
  const [activeNav, setActiveNav] = useState("coffee");
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [cart, setCart] = useState(INITIAL_CART);
  
  const [globalAddons, setGlobalAddons] = useState(INITIAL_GLOBAL_ADDONS);

  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [selectedTeaForModal, setSelectedTeaForModal] = useState(null);
  
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingConfigItem, setEditingConfigItem] = useState(null); 

  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [isSelectPromoModalOpen, setIsSelectPromoModalOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const handleToggleMenuStatus = (id) => {
    setMenu(prevMenu => 
      prevMenu.map(item => 
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleDeleteMenu = (id) => {
    if (window.confirm("คุณต้องการลบเมนูนี้ใช่หรือไม่?")) {
      setMenu(prevMenu => prevMenu.filter(item => item.id !== id));
    }
  };

  const handleAddNewMenu = (newItemData) => {
    const newMenu = {
      id: Date.now(), 
      category: newItemData.category,
      name: newItemData.name,
      price: Number(newItemData.price),
      qty: 0,
      stock: newItemData.stock, 
      isActive: true,
      config: null,
      imgSrc: null, 
      kind: newItemData.category === 'coffee' ? 'espresso' : newItemData.category
    };
    
    setMenu(prev => [...prev, newMenu]);
    setIsAddMenuOpen(false); 
  };

  const handleUpdateMenuStock = (id, newStock) => {
    setMenu(prev => prev.map(item => 
      item.id === id ? { ...item, stock: newStock } : item
    ));
  };

  const handleSaveMenuConfig = (id, data) => {
    setMenu(prevMenu => prevMenu.map(item => 
      item.id === id ? { ...item, config: data.config, price: data.price, name: data.name } : item
    ));
    setEditingConfigItem(null); 
  };

  const changeCartQty = (id, delta) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeCartItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const itemCount = cart.length;
  const quantityCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const currentNavLabel = NAV_ITEMS.find((nav) => nav.key === activeNav)?.label || "เมนู";

  return (
    <div className="pos">
      
      <style>{`
        .clean-search-input {
          background-color: transparent !important;
          color: #111827 !important;
        }
        .clean-search-input:focus {
          background-color: transparent !important;
          -webkit-box-shadow: none !important;
        }
        .clean-search-input::placeholder {
          color: #9ca3af !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
        }
      `}</style>

      {/* เอา <header className="pos-header"> ออกแล้ว */}

      <div className="pos-content">
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
              <button
                key={key}
                className={`pos-navitem ${activeNav === key ? "is-active" : "pos-navitem--muted"}`}
                onClick={() => setActiveNav(key)}
              >
                <ItemIcon className="pos-navitem__icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="pos-main">
          <div className="pos-body" style={{ flexDirection: (activeNav === "promo" || activeNav === "manage" || activeNav === "manage_addon") ? "column" : "row" }}>

            {activeNav === "manage_addon" ? (
              <AddonManagementView 
                addons={globalAddons}
                onToggleStatus={(id) => {
                  setGlobalAddons(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a))
                }}
                onAddAddon={(newAddon) => setGlobalAddons(prev => [...prev, newAddon])}
              />
            ) :

            activeNav === "promo" ? (
              <PromotionView
                onOpenAddPromoModal={() => setIsAddPromoModalOpen(true)}
                onEditPromo={(promo) => setIsAddPromoModalOpen(true)}
              />
            ) : 

            activeNav === "manage" ? (
              <MenuManagementView 
                menuItems={menu} 
                onToggleStatus={handleToggleMenuStatus}
                onDeleteMenu={handleDeleteMenu}
                onOpenAddMenuModal={() => {
                  setIsAddMenuOpen(true);
                }}
                onEditMenu={(item) => {
                  setEditingConfigItem(item); 
                }}
                onUpdateStock={handleUpdateMenuStock} 
              />
            ) : 
            
            (
              <>
                <section className="pos-menu">
                  <div className="pos-menu__head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div className="pos-menu__header-info">
                      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        หมวด{currentNavLabel}
                        <span style={{ fontWeight: 500, color: 'var(--gray-600)', fontSize: '16px' }}>
                          ({activeNav === 'coffee' ? 'Coffee Menu' : activeNav === 'tea' ? 'Tea Menu' : 'Snacks & Bakery'})
                        </span>
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>
                        จัดการรายการสินค้า ค้นหาเมนู และเพิ่มลงในออเดอร์ของลูกค้า
                      </p>
                    </div>

                    <div className="pos-search pos-search--inline" style={{ margin: 0, maxWidth: '340px', width: '340px' }}>
                      <Icon.Search className="pos-search__icon" />
                      
                      <input 
                        type="text" 
                        placeholder="ค้นหาเมนู (Search menu)..." 
                        className="clean-search-input" 
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="pos-menu__grid">
                    {menu
                      .filter((item) => item.category === activeNav && item.isActive)
                      .map((item) => {
                        const isOutOfStock = item.stock !== null && item.stock <= 0;

                        return (
                          <article 
                            className="pos-card" 
                            key={item.id}
                            onClick={() => {
                              if (!isOutOfStock) {
                                activeNav === "tea" ? setSelectedTeaForModal(item) : setSelectedItemForModal(item);
                              }
                            }}
                            style={{ 
                              opacity: isOutOfStock ? 0.6 : 1, 
                              position: 'relative',
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isOutOfStock && (
                              <div style={{ position: 'absolute', top: 12, right: 12, background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', zIndex: 10, boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' }}>
                                Sold Out
                              </div>
                            )}

                            <div className={`pos-card__image ${item.kind ? `is-${item.kind}` : ""}`}>
                              {item.imgSrc ? (
                                <img src={item.imgSrc} alt={item.name} className="pos-real-image" />
                              ) : (
                                item.kind === "espresso" && <div className="pos-cup" />
                              )}
                            </div>

                            <div className="pos-card__body">
                              {item.price !== null ? (<h3>{item.name}</h3>) : (<h3 className="pos-skeleton pos-skeleton--title" />)}
                              <div className="pos-card__row">
                                <div className="pos-card__price">
                                  <span className="pos-card__pricelabel">ราคา</span>
                                  {item.price !== null ? (
                                    <span className="pos-card__pricevalue">฿ {item.price}</span>
                                  ) : (
                                    <span className="pos-skeleton pos-skeleton--price" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                      
                      {menu.filter((item) => item.category === activeNav && item.isActive).length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', width: '100%', gridColumn: '1 / -1' }}>
                          ไม่มีเมนูเปิดขายในหมวดหมู่นี้
                        </div>
                      )}
                  </div>
                </section>

                <aside className="pos-order" style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  <div className="pos-order__items custom-scrollbar" style={{ flex: 1, overflowY: 'auto', marginTop: 0, marginBottom: '20px', paddingRight: '4px' }}>
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
                            <div className="pos-orderitem__price">฿{item.price.toFixed(2)}</div>
                          </div>
                          <div className="pos-orderitem__detail">{item.detail}</div>
                          <div className="pos-orderitem__extras">{item.extras}</div>
                          {item.note && <div className="pos-orderitem__note">{item.note}</div>}

                          <div className="pos-orderitem__footer">
                            <div className="pos-stepper pos-stepper--panel">
                              <button onClick={() => changeCartQty(item.id, -1)} aria-label="ลดจำนวน"><Icon.Minus /></button>
                              <span>{item.qty}</span>
                              <button onClick={() => changeCartQty(item.id, 1)} aria-label="เพิ่มจำนวน"><Icon.Plus /></button>
                            </div>
                            <button className="pos-iconbtn" onClick={() => removeCartItem(item.id)} aria-label="ลบรายการ">
                              <Icon.Trash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                      <div className="pos-order__empty" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        ยังไม่มีรายการสั่งซื้อ
                      </div>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <div className="pos-promo">
                      <div className="pos-promo__head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon.Tag className="pos-promo__icon" />
                          <span>โปรโมชั่น (Promotion)</span>
                        </div>
                        
                        {appliedPromo ? (
                          <span className="pos-pill pos-pill--green">ประหยัด {appliedPromo.value.replace('-', '')}</span>
                        ) : (
                          <span 
                            className="pos-pill pos-pill--green" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsSelectPromoModalOpen(true)}
                          >
                            + เพิ่มส่วนลด
                          </span>
                        )}
                      </div>

                      {appliedPromo ? (
                        <>
                          <div className="pos-promo__row">
                            <div className="pos-promo__label">
                              <span className="pos-dot pos-dot--green" />
                              {appliedPromo.title}
                            </div>
                            <div className="pos-promo__value" style={{ color: 'var(--green-600)', fontWeight: 'bold' }}>{appliedPromo.value}</div>
                          </div>
                          <div className="pos-promo__row pos-promo__row--sub">
                            <span>โค้ด: {appliedPromo.code}</span>
                            <button className="pos-linkbtn" onClick={() => setAppliedPromo(null)}>ยกเลิกส่วนลด</button>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '16px 0 8px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                          ยังไม่มีการเลือกโปรโมชั่น
                        </div>
                      )}
                    </div>

                    <div className="pos-total">
                      <div>
                        <div className="pos-total__label">Total</div>
                        <div className="pos-total__meta">
                          Items: {itemCount}, Quantity: {quantityCount}
                        </div>
                      </div>
                      <div className="pos-total__value">฿{cart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}</div>
                    </div>

                    <div className="pos-order__buttons">
                      <button className="pos-btn pos-btn--solid pos-btn--full" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Icon.Card />
                        Payments
                      </button>
                    </div>
                  </div>
                </aside>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Modals ---------------- */}

      {selectedItemForModal && (
        <CoffeeModal 
          item={selectedItemForModal} 
          globalAddons={globalAddons}
          onClose={() => setSelectedItemForModal(null)} 
          onAddToCart={(customizedItem) => setCart((prev) => [...prev, { ...customizedItem, id: Date.now() }])} 
        />
      )}
      
      {selectedTeaForModal && (
        <TeaModal 
          item={selectedTeaForModal} 
          globalAddons={globalAddons}
          onClose={() => setSelectedTeaForModal(null)} 
          onAddToCart={(customizedItem) => setCart((prev) => [...prev, { ...customizedItem, id: Date.now() }])} 
        />
      )}
      
      {isAddMenuOpen && (
        <AddNewItemModal 
          activeCategory={activeNav} 
          onClose={() => setIsAddMenuOpen(false)} 
          onSave={handleAddNewMenu} 
        />
      )}

      {editingConfigItem && (
        <MenuConfigModal 
          item={editingConfigItem} 
          globalAddons={globalAddons}
          onAddGlobalAddon={(newAddon) => setGlobalAddons(prev => [...prev, newAddon])}
          onClose={() => setEditingConfigItem(null)} 
          onSave={handleSaveMenuConfig} 
        />
      )}
      
      {isAddPromoModalOpen && (
        <AddPromotionModal onClose={() => setIsAddPromoModalOpen(false)} />
      )}
      
      {isSelectPromoModalOpen && (
        <SelectPromotionModal 
          onClose={() => setIsSelectPromoModalOpen(false)} 
          onSelectPromotion={(promo) => {
            setAppliedPromo(promo);
            setIsSelectPromoModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}