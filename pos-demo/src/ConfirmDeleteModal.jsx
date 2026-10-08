import React, { useEffect } from "react";

/**
 * ConfirmDeleteModal
 * Modal ยืนยันการลบ ธีมเดียวกับหน้าจัดการท็อปปิ้ง (ใช้แทน window.confirm)
 *
 * props:
 *  - title        หัวข้อ เช่น "ลบเมนู? (Delete Item?)"
 *  - itemName     ชื่อรายการที่จะลบ (แสดงเป็นตัวหนา)
 *  - description  ข้อความเสริมใต้ชื่อ (ไม่บังคับ)
 *  - confirmText  ข้อความปุ่มยืนยัน (ค่าเริ่มต้น "ลบ")
 *  - onConfirm / onCancel
 */
export default function ConfirmDeleteModal({
  title = "ลบรายการ?",
  itemName,
  description = "การกระทำนี้ไม่สามารถย้อนกลับได้",
  confirmText = "ลบ",
  onConfirm,
  onCancel,
}) {
  // กด Esc เพื่อปิด
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="cd-backdrop" onClick={onCancel}>
      <style>{`
        @keyframes cdFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cd-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center; z-index: 1400;
          font-family: "Noto Sans Thai", "Inter", sans-serif;
        }
        .cd-card {
          width: 420px; max-width: calc(100vw - 40px);
          padding: 32px 24px; text-align: center;
          display: flex; flex-direction: column; align-items: center;
          background: #fff; border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          animation: cdFadeIn 0.2s ease-out forwards;
        }
        .cd-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: #fef2f2; color: #ef4444;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .cd-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 8px; }
        .cd-desc { font-size: 14px; color: #6b7280; margin: 0 0 24px; line-height: 1.5; }
        .cd-desc strong { font-weight: 700; color: #374151; }
        .cd-actions { display: flex; gap: 12px; width: 100%; }
        .cd-btn {
          flex: 1; padding: 12px; border-radius: 12px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; justify-content: center; align-items: center; gap: 8px;
          transition: all 0.2s;
        }
        .cd-btn--cancel { border: 1px solid #d1d5db; background: #fff; color: #4b5563; }
        .cd-btn--cancel:hover { background: #f9fafb; }
        .cd-btn--danger { border: none; background: #dc2626; color: #fff; }
        .cd-btn--danger:hover { background: #b91c1c; }
      `}</style>

      <div className="cd-card" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="cd-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="cd-title">{title}</h3>
        <p className="cd-desc">
          {itemName && (<>คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>'{itemName}'</strong>?<br /></>)}
          {description}
        </p>

        <div className="cd-actions">
          <button type="button" className="cd-btn cd-btn--cancel" onClick={onCancel}>ยกเลิก</button>
          <button type="button" className="cd-btn cd-btn--danger" onClick={onConfirm}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6" />
            </svg>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}