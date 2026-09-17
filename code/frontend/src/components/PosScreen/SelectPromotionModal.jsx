import { useState, useEffect, useMemo } from "react";
import "./AddNewItemModal.css";
import { listPromotions } from "../../api/promotions";

const STAR_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function displayValue(p) {
  const v = Number(p.discountValue);
  return p.discountType === "PERCENT" ? `-${v}%` : `-฿${v.toFixed(2)}`;
}
function displaySubtitle(p) {
  if (p.minOrderAmount == null) return "ไม่มีขั้นต่ำ";
  return `ยอดขั้นต่ำ ฿${Number(p.minOrderAmount).toFixed(2)}`;
}

export function SelectPromotionModal({ onClose, onSelectPromotion }) {
  const [promotions, setPromotions] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [selectedPromoId, setSelectedPromoId] = useState(null);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    listPromotions({ active: true })
      .then(setPromotions)
      .catch((err) => {
        console.error("listPromotions failed:", err);
        setLoadError(err?.message ?? "โหลดโปรโมชั่นไม่สำเร็จ");
      });
  }, []);

  const filteredPromos = useMemo(() => {
    const q = manualCode.trim().toUpperCase();
    if (!q) return promotions;
    return promotions.filter((p) => p.code.toUpperCase().includes(q) || p.name.toUpperCase().includes(q));
  }, [promotions, manualCode]);

  const handleApplyPromo = (promo) => {
    setSelectedPromoId(promo.id);
    if (onSelectPromotion) onSelectPromotion(promo);
  };

  return (
    <div className="add-modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="add-modal" onClick={(e) => e.stopPropagation()}>
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </span>
            <div>
              <h2 className="add-modal__title">เลือกโปรโมชั่น (Select Promotion)</h2>
              <p className="add-modal__subtitle">เลือกส่วนลดจากรายการหรือกรอกโค้ดเพื่อกรอง</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="add-modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4b5563", marginBottom: "8px" }}>
              กรอกรหัสส่วนลด (Enter Promo Code)
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <input type="text" value={manualCode}
                     onChange={(e) => setManualCode(e.target.value)}
                     placeholder="เช่น MEMBER10, WELCOME20"
                     style={{ width: "100%", padding: "12px 16px 12px 38px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#ffffff", fontSize: "14px", outline: "none", color: "#111827" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#4b5563" }}>โปรโมชั่นที่ใช้ได้ (Available Promotions)</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981", background: "#ecfdf5", padding: "2px 8px", borderRadius: "6px" }}>
                {promotions.length} Active
              </span>
            </div>

            {loadError && <p style={{ color: "#c0392b" }}>{loadError}</p>}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "50vh", overflowY: "auto" }}>
              {filteredPromos.length === 0 && !loadError && (
                <p style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                  {manualCode ? `ไม่พบโปรที่ตรงกับ "${manualCode}"` : "ยังไม่มีโปรโมชั่นที่เปิดใช้งาน"}
                </p>
              )}
              {filteredPromos.map((promo) => {
                const isSelected = selectedPromoId === promo.id;
                return (
                  <div key={promo.id}
                       style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "12px", border: isSelected ? "2px solid #10b981" : "1px solid #e5e7eb", background: isSelected ? "#f0fdf4" : "#fff", transition: "all 0.2s", cursor: "pointer" }}
                       onClick={() => handleApplyPromo(promo)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "18px", height: "18px" }}>{STAR_ICON}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "2px" }}>{promo.name}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{displaySubtitle(promo)} · {promo.code}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#059669" }}>{displayValue(promo)}</span>
                      {isSelected ? (
                        <button style={{ background: "#10b981", color: "white", border: "none", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          เลือกแล้ว
                        </button>
                      ) : (
                        <button style={{ background: "#f3f4f6", color: "#4b5563", border: "none", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          เลือก
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
