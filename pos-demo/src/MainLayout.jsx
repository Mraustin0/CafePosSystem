import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

/* Icons ดึงมาจาก PosScreen */
const Icon = {
  Coffee: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 9h13a3 3 0 0 1 0 6h-1" strokeLinecap="round" /><path d="M4 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 4c-.6.8-.6 1.4 0 2M10 4c-.6.8-.6 1.4 0 2" strokeLinecap="round" /></svg>,
  Tea: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 9h14a3 3 0 0 1 0 6h-1" strokeLinecap="round" /><path d="M4 9v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 3c-1 1-1 2 0 3M12 3c-1 1-1 2 0 3" strokeLinecap="round" /></svg>,
  Snack: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="4" y="10" width="16" height="9" rx="2" /><path d="M4 10 12 4l8 6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Tag: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M11 3h6a2 2 0 0 1 2 2v6l-9 9-8-8z" strokeLinejoin="round" /><circle cx="15.5" cy="7.5" r="1.2" /></svg>,
  Grid: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  Layers: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><polygon points="12 2 2 7 12 12 22 7 12 12"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>,
  Edit: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
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
  { key: "dashboard", label: "Dashboard", icon: Icon.Grid },
];

export default function MainLayout({ activeNav, setActiveNav }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const handleNavClick = (key) => {
    if (key === "dashboard") {
      navigate("/dashboard");
    } else {
      setActiveNav(key);
      if (isDashboard) {
        navigate("/pos");
      }
    }
  };

  return (
    <div className="pos" style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div className="pos-content" style={{ display: "flex", height: "100%", width: "100%" }}>
        
        {/* Sidebar */}
        <aside 
          className="pos-sidebar" 
          style={{ 
            height: "100vh", 
            flexShrink: 0, 
            overflowY: "auto",
            zIndex: 10 
          }}
        >
          <nav className="pos-sidebar__nav">
            {NAV_ITEMS.map(({ key, label, icon: ItemIcon }) => (
              <button
                key={key}
                className={`pos-navitem ${!isDashboard && activeNav === key ? "is-active" : ""}`}
                onClick={() => handleNavClick(key)}
              >
                <ItemIcon className="pos-navitem__icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <nav className="pos-sidebar__footer">
            {NAV_FOOTER.map(({ key, label, icon: ItemIcon }) => {
              const isActive = key === "dashboard" ? isDashboard : (!isDashboard && activeNav === key);
              return (
                <button
                  key={key}
                  className={`pos-navitem ${isActive ? "is-active" : "pos-navitem--muted"}`}
                  onClick={() => handleNavClick(key)}
                >
                  <ItemIcon className="pos-navitem__icon" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* พื้นที่ฝั่งขวา — เพิ่ม minWidth: 0 และ boxSizing: "border-box" */}
        <div 
          className="pos-main" 
          style={{ 
            flex: 1, 
            minWidth: 0, // << เพิ่มจุดนี้เพื่อป้องกัน Flexbox ขยายเกินขอบจอ
            height: "100vh", 
            overflowY: "auto", 
            backgroundColor: "#f8fafc", 
            padding: "24px 32px",
            boxSizing: "border-box"
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}