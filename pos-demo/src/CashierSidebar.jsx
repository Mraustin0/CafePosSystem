import React from "react";

/* ---------------------------------------------------------
   Icons (เฉพาะที่เมนูของ Cashier ใช้)
--------------------------------------------------------- */
const Icon = {
  Coffee: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 9h13a3 3 0 0 1 0 6h-1" strokeLinecap="round" /><path d="M4 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 4c-.6.8-.6 1.4 0 2M10 4c-.6.8-.6 1.4 0 2" strokeLinecap="round" /></svg>,
  Tea: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 9h14a3 3 0 0 1 0 6h-1" strokeLinecap="round" /><path d="M4 9v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 3c-1 1-1 2 0 3M12 3c-1 1-1 2 0 3" strokeLinecap="round" /></svg>,
  Snack: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="4" y="10" width="16" height="9" rx="2" /><path d="M4 10 12 4l8 6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Receipt: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M21 2v20l-5-4-5 4-5-4-5 4V2a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1z" strokeLinejoin="round" /><path d="M7 10h10M7 14h6" strokeLinecap="round" /></svg>,
  User: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.4-3.6 4.3-5.4 7-5.4s5.6 1.8 7 5.4" strokeLinecap="round" /></svg>,
};

// เมนูหมวดสินค้า (หน้าขาย)
const NAV_ITEMS = [
  { key: "coffee", label: "กาแฟ", icon: Icon.Coffee },
  { key: "tea", label: "ชา", icon: Icon.Tea },
  { key: "snack", label: "ขนม", icon: Icon.Snack },
];

// เมนูด้านล่าง: บิลของตนเอง + โปรไฟล์ตัวเอง
const NAV_FOOTER = [
  { key: "bill_mgmt", label: "จัดการบิล", icon: Icon.Receipt },
  { key: "profile", label: "โปรไฟล์", icon: Icon.User },
];

/** key ของหน้าที่ Cashier เปิดได้ — PosScreen ใช้เช็กไม่ให้เข้าหน้าอื่น */
export const CASHIER_NAV_KEYS = [...NAV_ITEMS, ...NAV_FOOTER].map((n) => n.key);

/**
 * CashierSidebar — เมนูด้านข้างสำหรับ Cashier
 * ซ่อน: จัดการเมนู / จัดการท็อปปิ้ง / โปรโมชั่น / จัดการพนักงาน / Dashboard / ตั้งค่า
 * (โปรโมชั่น: Cashier เลือกโค้ดส่วนลดในหน้าขายแทน)
 *
 * props:
 *  - activeNav    key ของเมนูที่เลือกอยู่
 *  - onNavigate   (key) => void
 */
export default function CashierSidebar({ activeNav, onNavigate }) {
  return (
    <aside className="pos-sidebar" aria-label="เมนู Cashier">
      <nav className="pos-sidebar__nav">
        {NAV_ITEMS.map(({ key, label, icon: ItemIcon }) => (
          <button
            key={key}
            className={`pos-navitem ${activeNav === key ? "is-active" : ""}`}
            onClick={() => onNavigate(key)}
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
            onClick={() => onNavigate(key)}
          >
            <ItemIcon className="pos-navitem__icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}