import React, { useEffect, useRef, useState } from "react";
import "./AddNewItemModal.css";
import "./UserManagementView.css";

const PASSWORD_MIN = 8;

const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

/**
 * ResetPasswordModal — ให้ Admin ตั้งรหัสผ่านใหม่ให้พนักงาน
 *
 * props:
 *  - user                      พนักงานที่จะเปลี่ยนรหัส
 *  - onSave(userId, {type, value})  type = 'password'
 *  - onClose()
 *
 * หมายเหตุความปลอดภัย: ค่ารหัสไม่ควรถูกเก็บเป็นข้อความธรรมดา
 * เมื่อต่อ Backend ให้ส่งไปเข้ารหัส (hash) ที่ฝั่งเซิร์ฟเวอร์เท่านั้น
 */
export default function ResetPasswordModal({ user, onSave, onClose }) {
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  const handleSubmit = () => {
    if (value.length < PASSWORD_MIN)
      return setError(`รหัสผ่านต้องยาวอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`);
    if (value !== confirm) return setError("ค่าที่กรอกทั้งสองช่องไม่ตรงกัน");

    onSave?.(user.id, { type: "password", value });
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal" role="dialog" aria-modal="true" style={{ maxWidth: 520 }}>
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="15" r="4" />
                <path d="M10.85 12.15 19 4M18 5l3 3M15 8l2 2" />
              </svg>
            </span>
            <div>
              <h2 className="add-modal__title">เปลี่ยนรหัสผ่าน</h2>
              <p className="add-modal__subtitle">{fullName} · {user.code}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="add-modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="add-modal__body">
          <label className="add-field">
            <span className="add-field__label">รหัสผ่านใหม่ <span className="add-field__required">*</span></span>
            <div className="um-pass-wrap">
              <input
                ref={inputRef}
                className="add-input"
                type={show ? "text" : "password"}
                value={value}
                onChange={handleChange(setValue)}
                placeholder={`อย่างน้อย ${PASSWORD_MIN} ตัวอักษร`}
                autoComplete="new-password"
              />
              <button type="button" className="um-pass-eye" onClick={() => setShow((s) => !s)} aria-label={show ? "ซ่อน" : "แสดง"}>
                <EyeIcon off={show} />
              </button>
            </div>
          </label>

          <label className="add-field">
            <span className="add-field__label">ยืนยันรหัสผ่านใหม่ <span className="add-field__required">*</span></span>
            <input
              className="add-input"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={handleChange(setConfirm)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              autoComplete="new-password"
            />
          </label>

          <div className="um-note">
            พนักงานต้องใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป กรุณาแจ้งให้พนักงานทราบด้วยตนเอง
          </div>

          {error && <p className="um-error">{error}</p>}
        </div>

        <footer className="add-modal__footer">
          <button type="button" onClick={onClose} className="add-btn add-btn--ghost">ยกเลิก</button>
          <button type="button" onClick={handleSubmit} className="add-btn add-btn--solid">
            บันทึกรหัสผ่านใหม่
          </button>
        </footer>
      </div>
    </div>
  );
}