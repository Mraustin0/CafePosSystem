import React, { useState } from "react";
import "./AddNewItemModal.css";

export function EditStockModal({ item, onClose, onSave }) {
  // ดึงค่าสต็อกเดิมมาแสดงเป็นค่าเริ่มต้น
  const [stockValue, setStockValue] = useState(item.stock === null ? '' : item.stock);

  const handleSubmit = () => {
    // ถ้ากรอกค่าว่าง ให้ส่งเป็น null (ไม่จำกัด)
    const finalStock = stockValue === '' ? null : Number(stockValue);
    if (onSave) {
      onSave(item.id, finalStock);
    }
  };

  return (
    <div className="add-modal-overlay" style={{ zIndex: 1200 }}>
      <div className="add-modal" style={{ maxWidth: '400px' }}>
        {/* Header */}
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
            </span>
            <div>
              <h2 className="add-modal__title">อัปเดตสต็อก (Update Stock)</h2>
              <p className="add-modal__subtitle">
                ปรับปรุงจำนวนสินค้าคงเหลือ
              </p>
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
          {/* โชว์ชื่อเมนูที่กำลังแก้ไขให้แอดมินรู้ */}
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>กำลังแก้ไขเมนู:</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{item.name}</div>
          </div>

          <label className="add-field">
            <span className="add-field__label">จำนวนสต็อก (เว้นว่าง = มีของตลอด)</span>
            <input 
              type="number" 
              value={stockValue} 
              onChange={(e) => setStockValue(e.target.value)} 
              placeholder="เช่น 20" 
              className="add-input" 
            />
          </label>
        </div>

        {/* Footer */}
        <footer className="add-modal__footer">
          <button type="button" onClick={onClose} className="add-btn add-btn--ghost">
            ยกเลิก
          </button>
          <button type="button" className="add-btn add-btn--solid" onClick={handleSubmit}>
            บันทึกสต็อก
          </button>
        </footer>
      </div>
    </div>
  );
}