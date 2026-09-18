import React, { useState, useEffect } from "react";
import "./AddNewItemModal.css";

export function AddPromotionModal({ onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name ?? "ส่วนลดพิเศษสมาชิก (Member Special)");
  const [code, setCode] = useState(initial?.code ?? "MEMBER15");
  const [discountType, setDiscountType] = useState(initial?.discountType ?? "FIXED_AMOUNT");
  const [discountValue, setDiscountValue] = useState(initial?.discountValue != null ? String(initial.discountValue) : "15");
  const [hasMin, setHasMin] = useState(initial ? initial.minOrderAmount != null : true);
  const [minAmount, setMinAmount] = useState(initial?.minOrderAmount != null ? String(initial.minOrderAmount) : "200");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!initial) return;
    setName(initial.name ?? "");
    setCode(initial.code ?? "");
    setDiscountType(initial.discountType ?? "FIXED_AMOUNT");
    setDiscountValue(initial.discountValue != null ? String(initial.discountValue) : "");
    setHasMin(initial.minOrderAmount != null);
    setMinAmount(initial.minOrderAmount != null ? String(initial.minOrderAmount) : "200");
  }, [initial]);

  async function handleSave() {
    setSaveError(null);
    const vnum = Number(discountValue);
    const mnum = hasMin ? Number(minAmount) : null;
    if (!name.trim()) { setSaveError("กรุณากรอกชื่อโปรโมชั่น"); return; }
    if (!code.trim()) { setSaveError("กรุณากรอกรหัสโค้ด"); return; }
    if (!discountValue || Number.isNaN(vnum) || vnum < 0) { setSaveError("มูลค่าส่วนลดไม่ถูกต้อง"); return; }
    if (discountType === "PERCENT" && vnum > 100) { setSaveError("เปอร์เซ็นต์ต้องไม่เกิน 100"); return; }
    if (hasMin && (Number.isNaN(mnum) || mnum < 0)) { setSaveError("ยอดขั้นต่ำไม่ถูกต้อง"); return; }
    if (!onSubmit) { setSaveError("save handler not wired"); return; }
    setSaving(true);
    try {
      await onSubmit({ id: initial?.id ?? null, name: name.trim(), code: code.trim().toUpperCase(), discountType, discountValue: vnum, minOrderAmount: mnum, active: initial?.active ?? true });
      onClose();
    } catch (err) {
      setSaveError(err?.message ?? "บันทึกไม่สำเร็จ");
    } finally { setSaving(false); }
  }

  return (
    <div className="add-modal-overlay">
      <div className="add-modal">
        {/* Header */}
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </span>
            <div>
              <h2 className="add-modal__title">เพิ่มโปรโมชั่นใหม่ (Add New Promotion)</h2>
              <p className="add-modal__subtitle">สร้างคูปองส่วนลดหรือโปรโมชั่นพิเศษสำหรับร้านค้า</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="add-modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="add-modal__body">
          {/* Row 1 */}
          <div className="add-modal__row">
            <label className="add-field">
              <span className="add-field__label">ชื่อโปรโมชั่น (Promotion Name) <span className="add-field__required">*</span></span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="add-input" />
            </label>
            <label className="add-field">
              <span className="add-field__label">รหัสโค้ดส่วนลด (Promo Code) <span className="add-field__required">*</span></span>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="add-input" />
            </label>
          </div>

          {/* Row 2 */}
          <div className="add-modal__row">
            <label className="add-field">
              <span className="add-field__label">ประเภทส่วนลด (Discount Type) <span className="add-field__required">*</span></span>
              <div className="add-select-wrapper">
                <select className="add-input add-select" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <option value="FIXED_AMOUNT">ลดเป็นจำนวนเงิน (฿)</option>
                  <option value="PERCENT">ลดเป็นเปอร์เซ็นต์ (%)</option>
                </select>
                <svg className="add-select-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </label>
            <label className="add-field">
              <span className="add-field__label">มูลค่าส่วนลด (Discount Value) <span className="add-field__required">*</span></span>
              <div className="add-price-wrapper">
                <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} min="0" step="0.01" className="add-input add-input--price" style={{ paddingLeft: '16px', paddingRight: '40px' }} />
                <span className="add-price-symbol" style={{ left: 'auto', right: '16px', color: '#10b981' }}>{discountType === "PERCENT" ? "%" : "฿"}</span>
              </div>
            </label>
          </div>

          {/* Conditions */}
          <div>
            <p className="add-section-title" style={{ marginBottom: '10px' }}>เงื่อนไขเพิ่มเติม (Conditions)</p>
            <div className="add-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <label className="add-checkbox-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', margin: 0, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="add-checkbox-wrapper">
                    <input type="checkbox" checked={hasMin} onChange={(e) => setHasMin(e.target.checked)} className="add-checkbox-input" />
                    <svg className="add-checkbox-icon" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
                  </span>
                  กำหนดยอดซื้อขั้นต่ำ (Minimum Spend Requirement)
                </div>

                {/* 👉 เปลี่ยนเป็นช่องกรอกตัวเลขที่พิมพ์แก้ได้ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                  <span>ยอดขั้นต่ำ ฿</span>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    disabled={!hasMin}
                    min="0" step="0.01"
                    onClick={(e) => e.preventDefault()} /* ป้องกันไม่ให้คลิกช่องพิมพ์แล้ว checkbox เปลี่ยน */
                    style={{
                      width: '60px',
                      border: '1px solid #a7f3d0',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      fontWeight: 700,
                      fontSize: '13px',
                      outline: 'none',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      textAlign: 'center',
                      cursor: 'text',
                      opacity: hasMin ? 1 : 0.5,
                    }}
                  />
                </div>
              </label>

              <label className="add-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', margin: 0, cursor: 'pointer' }}>
                <span className="add-checkbox-wrapper">
                  <input type="checkbox" defaultChecked className="add-checkbox-input" />
                  <svg className="add-checkbox-icon" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
                </span>
                จำกัดการใช้งาน 1 ครั้งต่อ 1 สมาชิก (Limit 1 use per member)
              </label>

            </div>
          </div>
        </div>

        {saveError && <p style={{ color: "#c0392b", padding: "0 24px" }}>{saveError}</p>}

        {/* Footer */}
        <footer className="add-modal__footer">
          <button type="button" onClick={onClose} className="add-btn add-btn--ghost" disabled={saving}>ยกเลิก (Cancel)</button>
          <button type="button" className="add-btn add-btn--solid" onClick={handleSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึกโปรโมชั่นใหม่ (Save Promotion)"}
          </button>
        </footer>
      </div>
    </div>
  );
}