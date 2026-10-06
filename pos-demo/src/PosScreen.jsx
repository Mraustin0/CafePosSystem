import React, { useState, useEffect } from "react";
import "./PosScreen.css";

import CoffeeModal from "./CoffeeModal";
import TeaModal from "./TeaModal";
import { AddNewItemModal } from "./AddNewItemModal";
import PromotionView from "./PromotionView";
import { AddPromotionModal } from "./AddPromotionModal";
import MenuManagementView from "./MenuManagementView";
import { SelectPromotionModal } from "./SelectPromotionModal";
import MenuConfigModal from "./MenuConfigModal";
import AddonManagementView from "./AddonManagementView";
import BillManagementView from "./BillManagementView";
import UserManagementView from "./UserManagementView";
import DashboardView from "./DashboardView";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

import PaymentModal from "./PaymentModal";
import PaymentSuccessModal from "./PaymentSuccessModal";

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
  Layers: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 12 12 17 22 12" /><polyline points="2 17 12 22 22 17" /></svg>,
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
  Users: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c1.2-3.4 3.8-5 6-5s4.8 1.6 6 5" strokeLinecap="round" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 15.4c1.6.7 2.7 2.3 3.3 4.6" strokeLinecap="round" /></svg>,
  Receipt: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M21 2v20l-5-4-5 4-5-4-5 4V2a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1z" strokeLinejoin="round" /><path d="M7 10h10M7 14h6" strokeLinecap="round" /></svg>,
};

const NAV_ITEMS = [
  { key: "coffee", label: "กาแฟ", icon: Icon.Coffee },
  { key: "tea", label: "ชา", icon: Icon.Tea },
  { key: "snack", label: "ขนม", icon: Icon.Snack },
];

const NAV_FOOTER = [
  { key: "bill_mgmt", label: "จัดการบิล", icon: Icon.Receipt },
  { key: "manage", label: "จัดการเมนู", icon: Icon.Edit },
  { key: "manage_addon", label: "จัดการท็อปปิ้ง", icon: Icon.Layers },
  { key: "promo", label: "โปรโมชั่น", icon: Icon.Tag },
  { key: "users", label: "จัดการพนักงาน", icon: Icon.Users },
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

const INITIAL_USERS = [
  { id: 1, code: "EMP-001", firstName: "สมชาย", lastName: "ใจดี", username: "somchai.j", role: "admin", status: "active", credentialSet: true },
  { id: 2, code: "EMP-002", firstName: "วิภาวดี", lastName: "รักงาน", username: "wipawadee.r", role: "manager", status: "active", credentialSet: true },
  { id: 3, code: "EMP-003", firstName: "Alex", lastName: "Srisuk", username: "alex.s", role: "cashier", status: "active", credentialSet: true },
  { id: 4, code: "EMP-004", firstName: "Sarah", lastName: "Kaewmanee", username: "sarah.k", role: "cashier", status: "active", credentialSet: true },
  { id: 5, code: "EMP-005", firstName: "นภัสสร", lastName: "มั่นคง", username: "napatsorn.m", role: "cashier", status: "inactive", credentialSet: false },
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
  const [menuToDelete, setMenuToDelete] = useState(null);

  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [isSelectPromoModalOpen, setIsSelectPromoModalOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [editingPromo, setEditingPromo] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);

  const [billToOpen, setBillToOpen] = useState(null);
  useEffect(() => {
    if (activeNav !== "bill_mgmt") setBillToOpen(null);
  }, [activeNav]);

  const handleViewBill = (billId) => {
    setBillToOpen(billId ?? null);
    setActiveNav("bill_mgmt");
  };

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedPaymentData, setCompletedPaymentData] = useState(null);

  const handleToggleMenuStatus = (id) => {
    setMenu(prevMenu =>
      prevMenu.map(item =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleDeleteMenu = (id) => {
    const target = menu.find(item => item.id === id);
    if (target) setMenuToDelete(target);
  };

  const confirmDeleteMenu = () => {
    setMenu(prev => prev.filter(item => item.id !== menuToDelete.id));
    setMenuToDelete(null);
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

  const handleSavePromotion = (promo) => {
    setPromotions(prev =>
      prev.some(p => p.id === promo.id)
        ? prev.map(p => (p.id === promo.id ? promo : p))
        : [...prev, promo]
    );
  };

  const handleSaveUser = (user) =>
    setUsers(prev =>
      prev.some(u => u.id === user.id)
        ? prev.map(u => (u.id === user.id ? user : u))
        : [...prev, user]
    );

  const handleDeleteUser = (id) => setUsers(prev => prev.filter(u => u.id !== id));

  const handleToggleUserStatus = (id) =>
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));

  const handleResetUserPassword = (id, { type }) =>
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, credentialSet: true, credentialType: type } : u)));

  const closePromoModal = () => {
    setIsAddPromoModalOpen(false);
    setEditingPromo(null);
  };

  const changeCartQty = (id, delta) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeCartItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const itemCount = cart.length;
  const quantityCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const currentNavLabel = NAV_ITEMS.find((nav) => nav.key === activeNav)?.label || "เมนู";

  const isManagementTab = activeNav === "promo" || activeNav === "manage" || activeNav === "manage_addon" || activeNav === "bill_mgmt" || activeNav === "users" || activeNav === "dashboard";

  return (
    <div className="pos">

      <style>{`
        .pos-sidebar { overflow-y: auto; }
        .pos-sidebar__nav,
        .pos-sidebar__footer { gap: 12px; }

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

        .pos-menu { flex: 6 !important; min-width: 0; }
        .pos-order { flex: 4 !important; min-width: 400px !important; max-width: 520px !important; }

        .custom-cart-icon { width: 36px !important; height: 36px !important; font-size: 15px !important; border-radius: 10px !important; }
        .custom-cart-name { font-size: 16px !important; font-weight: 700 !important; }
        .custom-cart-price { font-size: 18px !important; font-weight: 800 !important; color: #ea580c !important; }
        .custom-cart-detail { font-size: 13px !important; margin-top: 4px; }
        .custom-new-badge { font-size: 11px !important; padding: 4px 8px !important; border-radius: 6px !important; }

        .custom-stepper { height: 36px !important; border-radius: 10px !important; }
        .custom-stepper button { width: 36px !important; height: 36px !important; }
        .custom-stepper span { font-size: 16px !important; font-weight: 700 !important; min-width: 32px !important; }
        .custom-trash-btn { width: 36px !important; height: 36px !important; border-radius: 10px !important; }
        .custom-trash-btn svg { width: 18px; height: 18px; }

        .custom-payment-btn { height: 64px !important; font-size: 18px !important; border-radius: 12px !important; background-color: #00694b !important; color: #ffffff !important; border: none !important; box-shadow: 0 4px 6px -1px rgba(0, 105, 75, 0.2) !important; }
        .custom-total-value { font-size: 32px !important; font-weight: 800 !important; color: #00694b !important; }

        /* 👉 Override pos-body เพื่อให้หน้าต่างๆ กางเต็มจอ แต่ยังรักษา Padding ด้านข้างเอาไว้ไม่ให้ชิดขอบเกินไป */
        .pos-body-management {
          padding: 24px 32px !important; /* คืนค่า Padding ให้ดูมีพื้นที่ (Breathing room) เหมือนเดิม */
          flex-direction: column;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }

        /* 
          สำหรับหน้า Bill Management (และหน้าที่ออกแบบ layout ใหม่แล้ว) 
          เราลบ Padding ของมันเองออก เพื่อไม่ให้ Padding ซ้อนทับกันสองรอบ
        */
        .bm-container .bm-list-pane {
           padding: 0 !important; 
        }
      `}</style>

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
          <div className={isManagementTab ? "pos-body pos-body-management" : "pos-body"} style={{ flexDirection: isManagementTab ? "column" : "row" }}>
            
            {activeNav === "dashboard" ? (
              <DashboardView onViewBill={handleViewBill} />
            ) :

            activeNav === "users" ? (
              <UserManagementView
                users={users}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
                onResetPassword={handleResetUserPassword}
              />
            ) :

            activeNav === "bill_mgmt" ? (
              <BillManagementView initialBillId={billToOpen} />
            ) :

            activeNav === "manage_addon" ? (
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
                promotions={promotions}
                onOpenAddPromoModal={() => {
                  setEditingPromo(null);
                  setIsAddPromoModalOpen(true);
                }}
                onEditPromo={(promo) => {
                  setEditingPromo(promo);
                  setIsAddPromoModalOpen(true);
                }}
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
                        <div className="pos-orderitem__icon custom-cart-icon" style={{ background: '#e6f7f1', color: '#00694b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {item.qty}x
                        </div>
                        <div className="pos-orderitem__body">
                          <div className="pos-orderitem__row">
                            <div className="pos-orderitem__name custom-cart-name">
                              {item.name}
                              {item.isNew && <span className="pos-badge custom-new-badge" style={{ background: '#f97316', color: '#fff' }}>ใหม่</span>}
                            </div>
                            <div className="pos-orderitem__price custom-cart-price">฿{(item.price * item.qty).toFixed(2)}</div>
                          </div>

                          <div className="pos-orderitem__detail custom-cart-detail">{item.detail}</div>
                          {item.extras && <div className="pos-orderitem__extras custom-cart-detail" style={{ color: '#059669', marginTop: '2px' }}>{item.extras}</div>}
                          {item.note && <div className="pos-orderitem__note custom-cart-detail" style={{ color: '#ea580c', marginTop: '2px' }}>* {item.note}</div>}

                          <div className="pos-orderitem__footer" style={{ marginTop: '16px' }}>
                            <div className="pos-stepper pos-stepper--panel custom-stepper">
                              <button onClick={() => changeCartQty(item.id, -1)} aria-label="ลดจำนวน" style={{ color: '#ef4444' }}><Icon.Minus /></button>
                              <span>{item.qty}</span>
                              <button onClick={() => changeCartQty(item.id, 1)} aria-label="เพิ่มจำนวน" style={{ color: '#f97316' }}><Icon.Plus /></button>
                            </div>
                            <button className="pos-iconbtn custom-trash-btn" onClick={() => removeCartItem(item.id)} aria-label="ลบรายการ">
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
                          <span style={{ fontSize: '15px', fontWeight: 600 }}>โปรโมชั่น (Promotion)</span>
                        </div>

                        {appliedPromo ? (
                          <span className="pos-pill pos-pill--green" style={{ fontSize: '13px', padding: '6px 12px' }}>ประหยัด {appliedPromo.value.replace('-', '')}</span>
                        ) : (
                          <span
                            className="pos-pill pos-pill--green"
                            style={{ cursor: 'pointer', fontSize: '13px', padding: '6px 12px' }}
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
                        <div style={{ padding: '16px 0 8px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                          ยังไม่มีการเลือกโปรโมชั่น
                        </div>
                      )}
                    </div>

                    <div className="pos-total" style={{ padding: '24px 0 16px' }}>
                      <div>
                        <div className="pos-total__label" style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Total</div>
                        <div className="pos-total__meta" style={{ fontSize: '13px' }}>
                          Items: {itemCount}, Quantity: {quantityCount}
                        </div>
                      </div>
                      <div className="pos-total__value custom-total-value">฿{cart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}</div>
                    </div>

                    <div className="pos-order__buttons">

                      <button
                        className="pos-btn pos-btn--solid pos-btn--full custom-payment-btn"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                        onClick={() => {
                          if (cart.length > 0) {
                            setIsPaymentModalOpen(true);
                          } else {
                            alert("กรุณาเพิ่มรายการสั่งซื้อก่อนชำระเงิน");
                          }
                        }}
                      >
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
        <AddPromotionModal
          editingPromo={editingPromo}
          onClose={closePromoModal}
          onSave={handleSavePromotion}
        />
      )}

      {isSelectPromoModalOpen && (
        <SelectPromotionModal
          promotions={promotions}
          onClose={() => setIsSelectPromoModalOpen(false)}
          onSelectPromotion={(promo) => {
            setAppliedPromo(promo);
            setIsSelectPromoModalOpen(false);
          }}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          cart={cart}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirmPayment={(data) => {
            setCompletedPaymentData({ ...data, cart: cart });
            setIsPaymentModalOpen(false);
          }}
        />
      )}

      {completedPaymentData && (
        <PaymentSuccessModal
          paymentData={completedPaymentData}
          onClose={() => {
            setCompletedPaymentData(null);
          }}
          onNewOrder={() => {
            setCart([]); 
            setAppliedPromo(null); 
            setCompletedPaymentData(null); 
          }}
        />
      )}

      {menuToDelete && (
        <ConfirmDeleteModal
          title="ลบเมนู? (Delete Item?)"
          itemName={menuToDelete.name}
          description="การกระทำนี้ไม่สามารถย้อนกลับได้"
          confirmText="ลบเมนู"
          onConfirm={confirmDeleteMenu}
          onCancel={() => setMenuToDelete(null)}
        />
      )}

    </div>
  );
}