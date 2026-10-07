import { useState, useEffect, useCallback, useMemo } from "react";
import "./PosScreen.css";
import CoffeeModal from "./CoffeeModal";
import TeaModal from "./TeaModal";
import { AddNewItemModal } from "./AddNewItemModal";
import PromotionView from "./PromotionView";
import { AddPromotionModal } from "./AddPromotionModal";
import MenuManagementView from "./MenuManagementView";
import { SelectPromotionModal } from "./SelectPromotionModal";
import AddonManagementView from "./AddonManagementView";
import MenuConfigModal from "./MenuConfigModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import PaymentModal from "./PaymentModal";
import PaymentSuccessModal from "./PaymentSuccessModal";
import BillManagementView from "./BillManagementView";
import DashboardView from "./DashboardView";
<<<<<<< Updated upstream
import UserManagementView from "./UserManagementView";
import SettingsView from "./SettingsView";
=======
>>>>>>> Stashed changes
import { listProducts, createProduct, updateProduct, setProductStatus } from "../../api/products";
import { listAddOns, createAddOn, setAddOnStatus, updateAddOn } from "../../api/addOns";
import { getCategories, navKeyFor, categoryForNav } from "../../api/categories";
import { createPromotion, updatePromotion } from "../../api/promotions";
import { createOrder, applyDiscount } from "../../api/orders";
import { payOrder } from "../../api/payment";
import { listUsers, createUser, updateUser, setUserStatus, resetUserPassword } from "../../api/users";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";

// Backend category → UI nav key resolved via navKeyFor() (case-insensitive, substring-aware).
// Kept here only so legacy lookups keep working if backend ever regresses to lowercase strings.

// Default customization options — backend only stores product name/price/addons, so the UI
// menus for serving/roast/sweetness are shared across products and populated from these
// defaults every load. addOns are still driven by the backend association.
const DEFAULT_SERVING = [
  { id: 'iced', label: 'เย็น (Iced)', price: 0, active: true },
  { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true },
  { id: 'frappe', label: 'ปั่น (Frappe +฿15)', price: 15, active: true },
];
const DEFAULT_ROASTS = [
  { id: 'medium', label: 'คั่วกลาง (Medium Roast)', desc: 'Nutty, Caramel, Balanced acidity', active: true },
  { id: 'dark', label: 'คั่วเข้ม (Dark Roast)', desc: 'Bold, Smokey, Dark Chocolate', active: true },
];
const DEFAULT_SWEETNESS = [
  { label: '100%', active: true }, { label: '75%', active: true },
  { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true },
];
// Reverse lookup — kept as a fallback hint; the authoritative source is the loaded `categories`
// state, resolved via categoryForNav(categories, navKey).
const NAV_TO_CATEGORY = { coffee: "Coffee", tea: "Tea", snack: "Bakery" };

/* ---------------------------------------------------------
   Icons
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
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Layers: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 12 12 17 22 12"/>
      <polyline points="2 17 12 22 22 17"/>
    </svg>
  ),
  Receipt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M21 2v20l-5-4-5 4-5-4-5 4V2a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1z" strokeLinejoin="round" />
      <path d="M7 10h10M7 14h6" strokeLinecap="round" />
    </svg>
  ),
};

/* ---------------------------------------------------------
   Static data
--------------------------------------------------------- */
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
  { key: "users", label: "จัดการพนักงาน", icon: Icon.User },
  { key: "dashboard", label: "Dashboard", icon: Icon.Grid },
  { key: "settings", label: "ตั้งค่า", icon: Icon.Gear },
];


export default function PosScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("coffee");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [selectedTeaForModal, setSelectedTeaForModal] = useState(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingConfigItem, setEditingConfigItem] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [globalAddons, setGlobalAddons] = useState([]);
  // User management (admin-only view) — list loaded on-demand from backend; mutations round-trip.
  const [users, setUsers] = useState([]);
  const [billToOpen, setBillToOpen] = useState(null);

  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [isSelectPromoModalOpen, setIsSelectPromoModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedPaymentData, setCompletedPaymentData] = useState(null);
  // P04: cache order id across payment retries — if createOrder succeeded but payOrder failed,
  // the next confirm should retry payment on the same order (not create a duplicate).
  const [pendingOrder, setPendingOrder] = useState(null);
  const [menuSearch, setMenuSearch] = useState("");

  // 👉 State เก็บข้อมูลโปรโมชั่นที่ลูกค้าเลือก
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const page = await listProducts({ size: 200 });
      const items = (page?.content ?? []).map((p) => ({
        id: p.id,
        category: navKeyFor(p.category?.name),
        name: p.name,
        price: p.price != null ? Number(p.price) : 0,
        qty: 0,
        imgSrc: p.imageUrl ?? null,
        kind: (p.name || "").match(/espresso/i) ? "espresso"
             : (p.name || "").match(/americano/i) ? "americano"
             : p.category?.name === "Tea" ? "tea"
             : p.category?.name === "Bakery" ? "snack" : "",
        active: p.active,
        isActive: p.active,  // MenuManagementView filters by `isActive`
        stock: null,         // backend doesn't persist stock yet
        config: {
          serving: DEFAULT_SERVING,
          roasts: p.category?.name === "Coffee" ? DEFAULT_ROASTS : [],
          sweetness: DEFAULT_SWEETNESS,
          addonIds: (p.addOns ?? []).map(a => a.id),
        },
      }));
      setMenu(items);
      setLoadError(null);
    } catch (err) {
      console.error("listProducts failed:", err);
      setLoadError(err?.message ?? "โหลดเมนูไม่สำเร็จ");
    }
  }, []);

  const loadAddons = useCallback(async () => {
    try {
      const items = await listAddOns();
      setGlobalAddons((items ?? []).map(a => ({
        id: a.id,
        label: a.name,
        desc: a.name,
        price: Number(a.price),
        isActive: a.active,
        category: 'all',
      })));
    } catch (err) {
      console.error("listAddOns failed:", err);
    }
  }, []);

  // Admin-only — silently empty for cashiers (403 handled by apiRequest; UI won't render for non-admins).
  const loadUsers = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const page = await listUsers({ size: 200 });
      setUsers((page?.content ?? []).map((u) => ({
        id: u.id,
        code: `EMP-${String(u.id).padStart(3, '0')}`,
        firstName: (u.fullName || '').split(' ')[0] || u.username,
        lastName: (u.fullName || '').split(' ').slice(1).join(' ') || '',
        username: u.username,
        role: u.role === 'ADMIN' ? 'admin' : 'cashier',
        status: u.active ? 'active' : 'inactive',
        credentialSet: true,
        phone: u.phone,
        email: u.email,
      })));
    } catch (err) {
      console.error("listUsers failed:", err);
    }
  }, [user?.role]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    loadProducts();
    loadAddons();
    loadUsers();
  }, [loadProducts, loadAddons, loadUsers]);

  useEffect(() => {
    const reload = () => loadProducts();
    window.addEventListener("products:reload", reload);
    return () => window.removeEventListener("products:reload", reload);
  }, [loadProducts]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + Number(i.price) * i.qty, 0), [cart]);
  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    // Ticket-03: enforce minimum-order rule before computing the discount amount.
    if (appliedPromo.minOrderAmount != null && subtotal < Number(appliedPromo.minOrderAmount)) return 0;
    // appliedPromo comes from SelectPromotionModal in Thana-nan's shape (has raw + value string)
    if (appliedPromo.discountType === "PERCENT") return Math.min(subtotal * Number(appliedPromo.discountValue) / 100, subtotal);
    if (appliedPromo.discountType === "FIXED_AMOUNT") return Math.min(Number(appliedPromo.discountValue), subtotal);
    return 0;
  }, [appliedPromo, subtotal]);
  const total = subtotal - promoDiscount;

  const cashierName = user?.fullName || user?.username || "แคชเชียร์";

  // P05: explicit method mapping — fail loud on unknown values instead of silently defaulting to CASH.
  const METHOD_MAP = { cash: "CASH", promptpay: "QR_CODE", card: "CARD" };

  // Called from PaymentModal after user picks method + confirms. Wires PaymentModal UI to backend
  // (createOrder + applyDiscount + payOrder), then opens PaymentSuccessModal on success.
  // paymentData shape from PaymentModal: { method: 'cash'|'promptpay'|'card', totalAmount, cashGiven, changeAmount }
  // P04: if createOrder+applyDiscount already succeeded on a prior attempt, reuse pendingOrder so
  //      a payment retry doesn't create a duplicate order.
  const handleConfirmPayment = async (paymentData) => {
    if (cart.length === 0) return;
    const method = METHOD_MAP[paymentData.method];
    if (!method) {
      alert(`วิธีชำระเงินไม่รองรับ: ${paymentData.method}`);
      return;
    }
    // P10: match backend BigDecimal scale=2 HALF_UP to avoid float precision mismatch on QR/CARD.
    const rawAmount = method === "CASH" ? paymentData.cashGiven : paymentData.totalAmount;
    const amountReceived = Number(Number(rawAmount).toFixed(2));
    // Guard rails for backend contract: NaN/negative always rejected; CASH must cover total; non-CASH must equal exactly.
    const dueTotal = Number(Number(paymentData.totalAmount ?? total).toFixed(2));
    if (!Number.isFinite(amountReceived) || amountReceived < 0) {
      alert('จำนวนเงินไม่ถูกต้อง');
      return;
    }
    if (method === 'CASH' && amountReceived < dueTotal) {
      alert(`เงินสดที่รับ (฿${amountReceived.toFixed(2)}) น้อยกว่ายอดที่ต้องชำระ (฿${dueTotal.toFixed(2)})`);
      return;
    }
    if (method !== 'CASH' && amountReceived !== dueTotal) {
      alert(`${method} ต้องชำระเท่ายอดเท่านั้น (฿${dueTotal.toFixed(2)})`);
      return;
    }

    setCheckoutBusy(true);
    try {
      let order = pendingOrder;
      if (!order) {
        const byProduct = new Map();
        for (const c of cart) {
          const pId = c.productId ?? c.id;
          const prev = byProduct.get(pId) ?? { productId: pId, quantity: 0, addOnIds: [] };
          prev.quantity += c.qty;
          byProduct.set(pId, prev);
        }
        order = await createOrder([...byProduct.values()]);
        if (appliedPromo && promoDiscount > 0) {
          order = await applyDiscount(order.id, {
            type: appliedPromo.discountType,
            value: Number(appliedPromo.discountValue),
          });
        }
        setPendingOrder(order);
      }
      const payment = await payOrder(order.id, { method, amountReceived });
      setCurrentOrder({ ...order, payment });
      setPendingOrder(null);
      setIsPaymentModalOpen(false);
      // P06/P07/P09: hand PaymentSuccessModal the backend-authoritative values
      // (change, orderNumber) plus the cashier from the session so the receipt reflects real data.
      setCompletedPaymentData({
        ...paymentData,
        changeAmount: payment?.change != null ? Number(payment.change) : paymentData.changeAmount,
        orderId: order?.orderNumber ?? paymentData.orderId,
        cashierName: user?.username ?? user?.name ?? user?.email ?? 'Cashier',
        cart,
        order,
        payment,
      });
    } catch (err) {
      console.error("checkout failed:", err);
      alert(`Checkout ล้มเหลว (${err?.status ?? "no status"}): ${err?.message ?? err}`);
    } finally {
      setCheckoutBusy(false);
    }
  };

  const handleSaveMenuConfig = async (id, data) => {
    const existing = menu.find((m) => m.id === id);
    const cat = categoryForNav(categories, existing?.category);
    try {
      await updateProduct(id, {
        categoryId: cat?.id,
        name: data.name,
        price: data.price,
        imageUrl: null,
        addOnIds: data.config?.addonIds ?? [],
      });
      await loadProducts();
    } catch (err) {
      alert(err?.message ?? 'บันทึกเมนูไม่สำเร็จ');
      return;
    }
    setEditingConfigItem(null);
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

  const currentNavLabel = NAV_ITEMS.find((nav) => nav.key === activeNav)?.label || "เมนู";

  // UserManagementView handlers — all route through the admin users API (403 for cashiers).
  const handleSaveUser = async (payload) => {
    // UserModal returns { id, firstName, lastName, username, role, status, phone, email, password? }.
    // Backend expects fullName (not split name) and role in uppercase.
    const body = {
      username: payload.username,
      role: payload.role === 'admin' ? 'ADMIN' : 'CASHIER',
      fullName: `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim() || payload.username,
      phone: payload.phone || null,
      email: payload.email || null,
    };
    try {
      if (payload.id && users.some((u) => u.id === payload.id)) {
        await updateUser(payload.id, body);
      } else {
        if (!payload.password) { alert('กรุณาตั้งรหัสผ่านสำหรับผู้ใช้ใหม่'); return; }
        await createUser({ ...body, password: payload.password });
      }
      await loadUsers();
    } catch (err) {
      alert(err?.message ?? 'บันทึกผู้ใช้ไม่สำเร็จ');
    }
  };

  // No hard-delete endpoint for users — soft-delete via setStatus(false) to preserve audit trail.
  const handleDeleteUser = async (id) => {
    try { await setUserStatus(id, false); await loadUsers(); }
    catch (err) { alert(err?.message ?? 'ลบผู้ใช้ไม่สำเร็จ'); }
  };

  const handleToggleUserStatus = async (id) => {
    const u = users.find((x) => x.id === id);
    try { await setUserStatus(id, u?.status !== 'active'); await loadUsers(); }
    catch (err) { alert(err?.message ?? 'เปลี่ยนสถานะไม่สำเร็จ'); }
  };

  // BE-08: admin-side password reset. UserManagementView sends { type: 'password'|'pin', value }.
  // Backend takes any 8+ char string — PIN is a shorter credential UX but stored as a password.
  const handleResetUserPassword = async (id, payload) => {
    const newPassword = payload?.value ?? payload?.newPassword;
    if (!newPassword || String(newPassword).length < 8) {
      alert('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    try { await resetUserPassword(id, String(newPassword)); alert('ตั้งรหัสใหม่สำเร็จ'); }
    catch (err) { alert(err?.message ?? 'ตั้งรหัสใหม่ไม่สำเร็จ'); }
  };

  // Toggle product active/inactive from MenuManagementView.
  const handleToggleMenuStatus = async (id) => {
    const item = menu.find((m) => m.id === id);
    if (!item) return;
    try { await setProductStatus(id, !item.active); await loadProducts(); }
    catch (err) { alert(err?.message ?? 'เปลี่ยนสถานะเมนูไม่สำเร็จ'); }
  };

  // Stock is client-only — backend doesn't persist product stock yet.
  const handleUpdateMenuStock = (id, stock) => {
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, stock } : m)));
  };

  // Dashboard asks to jump to a specific bill; drops into Bill Management with that id pre-selected.
  const handleViewBill = (billId) => {
    setBillToOpen(billId ?? null);
    setActiveNav('bill_mgmt');
  };

  return (
    <div className="pos">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
        }
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

        /* -------------------------------------------
           สไตล์ส่วนขยายฝั่งตะกร้า (Cart Panel) — ported from Thana-nan pos-demo
           ------------------------------------------- */
        .custom-cart-icon {
          width: 36px !important;
          height: 36px !important;
          font-size: 15px !important;
          border-radius: 10px !important;
        }
        .custom-cart-name {
          font-size: 16px !important;
          font-weight: 700 !important;
        }
        .custom-cart-price {
          font-size: 18px !important;
          font-weight: 800 !important;
          color: #ea580c !important;
        }
        .custom-cart-detail {
          font-size: 13px !important;
          margin-top: 4px;
        }
        .custom-new-badge {
          font-size: 11px !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
        }
        .custom-stepper {
          height: 36px !important;
          border-radius: 10px !important;
        }
        .custom-stepper button {
          width: 36px !important;
          height: 36px !important;
        }
        .custom-stepper span {
          font-size: 16px !important;
          font-weight: 700 !important;
          min-width: 32px !important;
        }
        .custom-trash-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 10px !important;
        }
        .custom-trash-btn svg {
          width: 18px;
          height: 18px;
        }
        .custom-payment-btn {
          height: 64px !important;
          font-size: 18px !important;
          border-radius: 12px !important;
          background-color: #00694b !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 105, 75, 0.2) !important;
        }
        .custom-total-value {
          font-size: 32px !important;
          font-weight: 800 !important;
          color: #00694b !important;
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
            {user?.role === 'ADMIN' && (
              <button
                className="pos-navitem pos-navitem--muted"
                onClick={() => navigate('/add-user')}
              >
                <Icon.User className="pos-navitem__icon" />
                <span>เพิ่มผู้ใช้</span>
              </button>
            )}
          </nav>
        </aside>

        {/* -------- Main column -------- */}
        <div className="pos-main">
          <div className="pos-body" style={{ flexDirection: (activeNav === "promo" || activeNav === "manage" || activeNav === "manage_addon" || activeNav === "bill_mgmt" || activeNav === "dashboard" || activeNav === "users" || activeNav === "settings") ? "column" : "row" }}>

            {activeNav === "dashboard" ? (
              <DashboardView onViewBill={handleViewBill} />
            ) :

            activeNav === "settings" ? (
              <SettingsView />
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
                onToggleStatus={async (id) => {
                  const addon = globalAddons.find(a => a.id === id);
                  if (!addon) return;
                  try { await setAddOnStatus(id, !addon.isActive); await loadAddons(); } catch (err) { alert(err?.message ?? 'เปลี่ยนสถานะไม่สำเร็จ'); }
                }}
                onAddAddon={async (newAddon) => {
                  try { await createAddOn({ name: newAddon.label, price: newAddon.price }); await loadAddons(); } catch (err) { alert(err?.message ?? 'สร้าง Add-on ไม่สำเร็จ'); }
                }}
                onEditAddon={async (patch) => {
                  // Backend only persists name + price; desc/category stay client-side.
                  try { await updateAddOn(patch.id, { name: patch.label, price: patch.price }); await loadAddons(); } catch (err) { alert(err?.message ?? 'แก้ไข Add-on ไม่สำเร็จ'); }
                }}
                onDeleteAddon={async (id) => {
                  // No hard-delete endpoint; soft-delete via setAddOnStatus(false).
                  try { await setAddOnStatus(id, false); await loadAddons(); } catch (err) { alert(err?.message ?? 'ลบ Add-on ไม่สำเร็จ'); }
                }}
              />
            ) :

            activeNav === "promo" ? (
              <PromotionView
                onOpenAddPromoModal={() => { setEditingPromo(null); setIsAddPromoModalOpen(true); }}
                onEditPromo={(promo) => { setEditingPromo(promo); setIsAddPromoModalOpen(true); }}
              />
            ) :

            activeNav === "manage" ? (
              <MenuManagementView
                menuItems={menu}
                onToggleStatus={handleToggleMenuStatus}
                onOpenAddMenuModal={() => setIsAddMenuOpen(true)}
                onEditMenu={(item) => setEditingConfigItem(item)}
<<<<<<< Updated upstream
                onDeleteMenu={(id) => {
                  // Kawinthida's MenuManagementView now calls onDeleteMenu(id); normalize into our { id, name } shape.
                  const target = menu.find((m) => m.id === id);
                  if (target) setMenuToDelete({ id, name: target.name });
                }}
                onUpdateStock={handleUpdateMenuStock}
=======
                onDeleteMenu={(target) => setMenuToDelete(target)}
>>>>>>> Stashed changes
              />
            ) :

            /* โชว์หน้าแคชเชียร์ขายของปกติ (โชว์เฉพาะหมวดที่เลือก + มีใบเสร็จ) */
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
                      <input type="text" placeholder="ค้นหาเมนู (Search menu)..." className="clean-search-input" autoComplete="off" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} />
                    </div>

                  </div>

                  <div className="pos-menu__grid">
                    {menu
                      .filter((item) => item.category === activeNav && item.active && (menuSearch.trim() === "" || item.name?.toLowerCase().includes(menuSearch.trim().toLowerCase())))
                      .map((item) => {
                        const isOutOfStock = item.stock !== undefined && item.stock <= 0;
                        return (
                        <article
                          className="pos-card"
                          key={item.id}
                          onClick={() => { if (!isOutOfStock) { activeNav === "tea" ? setSelectedTeaForModal(item) : setSelectedItemForModal(item); } }}
                          style={{ opacity: isOutOfStock ? 0.6 : 1, position: 'relative', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
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
                        ); })}
                  </div>
                </section>

                <aside className="pos-order" style={{ display: 'flex', flexDirection: 'column' }}>

                  <div className="pos-order__items custom-scrollbar" style={{ flex: 1, overflowY: 'auto', marginTop: 0, marginBottom: '20px', paddingRight: '4px' }}>
                    {cart.map((item) => (
                      <div className="pos-orderitem" key={item.id}>
                        {/* 👉 แทนที่ไอคอนด้วยป้าย 1x */}
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

                          {/* 👉 รายละเอียดเมนูที่ใหญ่ขึ้น */}
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
                      <div className="pos-total__value custom-total-value">฿{total.toFixed(2)}</div>
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
                        disabled={cart.length === 0 || checkoutBusy}
                      >
                        <Icon.Card />
                        {checkoutBusy ? "..." : "Payments"}
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
          onAddToCart={(customizedItem) => { setCart((prev) => [...prev, { ...customizedItem, productId: selectedItemForModal.id, id: Date.now() + Math.random() }]); }}
        />
      )}

      {selectedTeaForModal && (
        <TeaModal
          item={selectedTeaForModal}
          globalAddons={globalAddons}
          onClose={() => setSelectedTeaForModal(null)}
          onAddToCart={(customizedItem) => { setCart((prev) => [...prev, { ...customizedItem, productId: selectedTeaForModal.id, id: Date.now() + Math.random() }]); }}
        />
      )}

      {editingConfigItem && (
        <MenuConfigModal
          item={editingConfigItem}
          globalAddons={globalAddons}
          onAddGlobalAddon={async (newAddon) => {
            try { await createAddOn({ name: newAddon.label, price: newAddon.price }); await loadAddons(); } catch (err) { alert(err?.message ?? 'สร้าง Add-on ไม่สำเร็จ'); }
          }}
          onClose={() => setEditingConfigItem(null)}
          onSave={handleSaveMenuConfig}
        />
      )}

      {isAddMenuOpen && (
        <AddNewItemModal
          activeCategory={NAV_TO_CATEGORY[activeNav] ? activeNav : "coffee"}
          onClose={() => setIsAddMenuOpen(false)}
          onSubmit={async (form) => {
            const cat = categoryForNav(categories, form.category);
            if (!cat) throw new Error(`ไม่พบหมวดสำหรับ nav key "${form.category}" ในฐานข้อมูล`);
            try {
              await createProduct({ categoryId: cat.id, name: form.name, price: form.price, imageUrl: null, addOnIds: [] });
              window.dispatchEvent(new Event("products:reload"));
            } catch (err) {
              if (err?.status === 403) throw new Error("ต้อง login เป็น ADMIN");
              if (err?.status === 409) throw new Error(`ชื่อเมนูซ้ำ: "${form.name}"`);
              throw new Error(`บันทึกไม่สำเร็จ (${err?.status ?? "no status"}): ${err?.message ?? err}`);
            }
          }}
        />
      )}

      {isAddPromoModalOpen && (
        <AddPromotionModal
          initial={editingPromo}
          onClose={() => { setIsAddPromoModalOpen(false); setEditingPromo(null); }}
          onSubmit={async (form) => {
            const body = { code: form.code, name: form.name, discountType: form.discountType, discountValue: form.discountValue, minOrderAmount: form.minOrderAmount, active: form.active };
            try {
              if (form.id) await updatePromotion(form.id, body);
              else await createPromotion(body);
              window.dispatchEvent(new Event("promotions:reload"));
            } catch (err) {
              if (err?.status === 403) throw new Error("ต้อง login เป็น ADMIN");
              if (err?.status === 409) throw new Error(`โค้ดซ้ำ: "${form.code}"`);
              throw new Error(`บันทึกไม่สำเร็จ (${err?.status ?? "no status"}): ${err?.message ?? err}`);
            }
          }}
        />
      )}

      {/* 👉 ส่ง onSelectPromotion ให้ Modal เพื่อเอาข้อมูลกลับมาเซ็ตเข้า State `appliedPromo` */}
      {isSelectPromoModalOpen && (
        <SelectPromotionModal
          subtotal={subtotal}
          onClose={() => setIsSelectPromoModalOpen(false)}
          onSelectPromotion={(promo) => {
            setAppliedPromo(promo); // เซ็ตโปรที่เลือกลง State
            setIsSelectPromoModalOpen(false); // ปิด Modal
          }}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          discountAmount={promoDiscount}
          promoName={appliedPromo?.title ?? appliedPromo?.name ?? null}
          onClose={() => { setIsPaymentModalOpen(false); setPendingOrder(null); }}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {completedPaymentData && (
        <PaymentSuccessModal
          paymentData={completedPaymentData}
          onClose={() => setCompletedPaymentData(null)}
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
          description="เมนูนี้จะถูกปิดการขาย — ลูกค้ามองไม่เห็นในหน้า POS แต่บิลเก่าที่ขายไปแล้วยังอยู่ครบ"
          confirmText="ปิดการขาย"
          onConfirm={async () => {
            try {
              await setProductStatus(menuToDelete.id, false);
              window.dispatchEvent(new Event('products:reload'));
            } catch (err) {
              alert(err?.message ?? 'ปิดเมนูไม่สำเร็จ');
            } finally {
              setMenuToDelete(null);
            }
          }}
          onCancel={() => setMenuToDelete(null)}
        />
      )}

    </div>
  );
}