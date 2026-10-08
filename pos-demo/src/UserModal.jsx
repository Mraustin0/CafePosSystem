import React, { useEffect, useRef, useState } from "react";
import "./AddNewItemModal.css";
import "./UserManagementView.css";

/* บทบาทของพนักงาน — คำอธิบายสิทธิ์เป็นข้อความตัวอย่าง ปรับให้ตรงกับระบบจริงได้ */
export const ROLE_OPTIONS = [
  { key: "admin", label: "Admin", desc: "จัดการระบบและพนักงานได้ทั้งหมด" },
  { key: "cashier", label: "Cashier", desc: "ขายและรับชำระเงินหน้าร้าน" },
];

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,20}$/;

/**
 * UserModal — เพิ่ม / แก้ไขพนักงาน
 *
 * props:
 *  - user           พนักงานที่แก้ไข (ไม่ส่ง = เพิ่มใหม่)
 *  - nextCode       รหัสพนักงานที่จะสร้างให้ (แสดงตอนเพิ่มใหม่)
 *  - existingUsers  ใช้ตรวจ Username ซ้ำ
 *  - onSave(data)   คืนค่า string = ข้อความผิดพลาด (ฟอร์มจะค้างไว้) / คืนค่าอื่น = สำเร็จ
 *  - onClose()
 */
export default function UserModal({ user = null, nextCode, existingUsers = [], onSave, onClose }) {
  const isEdit = !!user;

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  // ถ้า role เดิมไม่อยู่ใน ROLE_OPTIONS แล้ว (เช่น manager ที่ถูกเอาออก) ให้ใช้ cashier แทน
  const [role, setRole] = useState(
    ROLE_OPTIONS.some((r) => r.key === user?.role) ? user.role : "cashier"
  );
  const [isActive, setIsActive] = useState((user?.status ?? "active") === "active");
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

    if (!fn || !ln) return setError("กรุณากรอกชื่อและนามสกุล");
    if (!USERNAME_RE.test(un))
      return setError("Username ต้องยาว 3–20 ตัว ใช้ได้เฉพาะ a-z, 0-9 และเครื่องหมาย . _ -");
    const duplicated = existingUsers.some(
      (u) => u.id !== user?.id && u.username.toLowerCase() === un.toLowerCase()
    );
    if (duplicated) return setError("Username นี้ถูกใช้แล้ว กรุณาใช้ชื่ออื่น");

    const result = onSave?.({
      firstName: fn,
      lastName: ln,
      username: un,
      role,
      status: isActive ? "active" : "inactive",
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
            <p className="um-modal-hint" style={{ marginTop: 0 }}>
              {isEdit ? "รหัสพนักงานแก้ไขไม่ได้" : "รหัสพนักงานสร้างให้อัตโนมัติ"}
            </p>
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
            <p className="um-modal-hint">ใช้สำหรับเข้าสู่ระบบ (a-z, 0-9, . _ - ความยาว 3–20 ตัว)</p>
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

          <div className="add-toggle-row">
            <span className="add-toggle-label">สถานะ</span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label="สถานะการใช้งาน"
              className={`add-toggle ${isActive ? "is-on" : "is-off"}`}
              onClick={() => setIsActive((v) => !v)}
            >
              <span className="add-toggle__circle" />
            </button>
            <span className="add-toggle-text">
              {isActive ? "Active — เข้าสู่ระบบได้" : "Inactive — ระงับการเข้าสู่ระบบ"}
            </span>
          </div>

          {!isEdit && (
            <div className="um-note">
              หลังเพิ่มพนักงานแล้ว ให้ตั้งรหัสผ่านเริ่มต้นจากปุ่มกุญแจในตารางรายชื่อ
            </div>
          )}

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