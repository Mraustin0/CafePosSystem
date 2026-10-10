import React, { useEffect, useRef, useState } from "react";
import "./AddNewItemModal.css";
import "./UserManagementView.css";

/* บทบาทของพนักงาน */
export const ROLE_OPTIONS = [
  { key: "admin", label: "Admin", desc: "จัดการระบบและพนักงานได้ทั้งหมด" },
  { key: "cashier", label: "Cashier", desc: "ขายและรับชำระเงินหน้าร้าน" },
];

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,20}$/;

/**
 * UserModal — เพิ่ม / แก้ไขพนักงาน (นำคำอธิบายใต้กล่องออก)
 */
export default function UserModal({ user = null, nextCode, existingUsers = [], onSave, onClose }) {
  const isEdit = !!user;

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(
    ROLE_OPTIONS.some((r) => r.key === user?.role) ? user.role : "cashier"
  );
  const [error, setError] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const un = username.trim();
    const pass = password.trim();
    const confirmPass = confirmPassword.trim();

    if (!fn || !ln) return setError("กรุณากรอกชื่อและนามสกุล");
    if (!USERNAME_RE.test(un))
      return setError("Username ต้องยาว 3–20 ตัว ใช้ได้เฉพาะ a-z, 0-9 และเครื่องหมาย . _ -");
    
    if (!isEdit) {
      if (!pass) return setError("กรุณากำหนดรหัสผ่านสำหรับการเข้าใช้งาน");
      if (pass.length < 6) return setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      if (pass !== confirmPass) return setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
    } else if (pass) {
      if (pass.length < 6) return setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      if (pass !== confirmPass) return setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
    }

    const duplicated = existingUsers.some(
      (u) => u.id !== user?.id && u.username.toLowerCase() === un.toLowerCase()
    );
    if (duplicated) return setError("Username นี้ถูกใช้แล้ว กรุณาใช้ชื่ออื่น");

    const result = onSave?.({
      firstName: fn,
      lastName: ln,
      username: un,
      role,
      status: user?.status ?? "active",
      ...(pass ? { password: pass } : {}),
    });
    if (typeof result === "string") setError(result);
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal" role="dialog" aria-modal="true" style={{ maxWidth: 640 }}>
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M5 20c1.4-3.6 4.3-5.4 7-5.4s5.6 1.8 7 5.4" />
              </svg>
            </span>
            <div>
              <h2 className="add-modal__title">
                {isEdit ? "แก้ไขพนักงาน (Edit Employee)" : "เพิ่มพนักงานใหม่ (Add Employee)"}
              </h2>
              <p className="add-modal__subtitle">
                {isEdit ? "ปรับปรุงข้อมูลและสิทธิ์การใช้งานของพนักงาน" : "สร้างบัญชีผู้ใช้สำหรับพนักงานในร้าน"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="add-modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="add-modal__body">
          <div>
            <span className="um-modal-code">{isEdit ? user.code : nextCode}</span>
          </div>

          <div className="add-modal__row">
            <label className="add-field">
              <span className="add-field__label">ชื่อ (First Name) <span className="add-field__required">*</span></span>
              <input
                ref={firstRef}
                type="text"
                className="add-input"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(""); }}
                placeholder="เช่น สมชาย"
                autoComplete="off"
              />
            </label>
            <label className="add-field">
              <span className="add-field__label">นามสกุล (Last Name) <span className="add-field__required">*</span></span>
              <input
                type="text"
                className="add-input"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(""); }}
                placeholder="เช่น ใจดี"
                autoComplete="off"
              />
            </label>
          </div>

          <label className="add-field">
            <span className="add-field__label">Username <span className="add-field__required">*</span></span>
            <input
              type="text"
              className="add-input"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="เช่น somchai.j"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </label>

          {/* ช่องกรอกรหัสผ่าน */}
          <label className="add-field">
            <span className="add-field__label">
              รหัสผ่าน (Password) {!isEdit && <span className="add-field__required">*</span>}
            </span>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="add-input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={isEdit ? "เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน" : "กำหนดรหัสผ่านสำหรับการเข้าใช้งาน"}
                autoComplete="new-password"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </label>

          {/* ช่องยืนยันรหัสผ่าน */}
          <label className="add-field">
            <span className="add-field__label">
              ยืนยันรหัสผ่าน (Confirm Password) {!isEdit && <span className="add-field__required">*</span>}
            </span>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="add-input"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                autoComplete="new-password"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
                title={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </label>

          <div>
            <p className="add-section-title">บทบาท (Role) <span className="add-field__required">*</span></p>
            <div className="um-roles" role="radiogroup" aria-label="บทบาท">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  role="radio"
                  aria-checked={role === r.key}
                  className={`um-role-card ${role === r.key ? "active" : ""}`}
                  onClick={() => { setRole(r.key); setError(""); }}
                >
                  <span className="um-role-card__name">{r.label}</span>
                  <span className="um-role-card__desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="um-error">{error}</p>}
        </div>

        <footer className="add-modal__footer">
          <button type="button" onClick={onClose} className="add-btn add-btn--ghost">ยกเลิก</button>
          <button type="button" onClick={handleSubmit} className="add-btn add-btn--solid">
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
          </button>
        </footer>
      </div>
    </div>
  );
}