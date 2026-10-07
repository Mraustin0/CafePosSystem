import React, { useState, useRef, useEffect } from "react";
import "./SettingsView.css";

/* ---------- Icons ---------- */
const Icon = {
  Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>,
  Dots: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>,
  Chevron: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Pencil: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 20h9" strokeLinecap="round" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Key: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="7.5" cy="15.5" r="4.5" /><path d="m21 2-9.6 9.6" strokeLinecap="round" /><path d="m15.5 7.5 3 3L22 7l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Users: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>,
  LogOut: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

/* ---------- Mock Data ---------- */
const INITIAL_USERS = [
  { id: 1, fullName: "สมชาย ใจดี", username: "Disksy", role: "ADMIN", active: true },
  { id: 2, fullName: "พลอย แสงดี", username: "Tinny", role: "CASHIER", active: true },
  { id: 3, fullName: "หนึ่ง จันทร์เพ็ญ", username: "Chommy", role: "CASHIER", active: true },
  { id: 4, fullName: "ทิพย์ วงศ์งาม", username: "Tzoey", role: "CASHIER", active: false },
];

/* ---------- Sub Components ---------- */
function ToggleSwitch({ checked, onChange }) {
  return (
    <div className="st-status-cell">
      <label className="st-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="st-slider" />
      </label>
      <span className={`st-status-label ${checked ? "is-active" : "is-inactive"}`}>
        {checked ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

function RowMenu({ onEdit, onResetPassword }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div className="st-menu" ref={ref}>
      <button type="button" className="st-iconbtn" onClick={() => setOpen((v) => !v)} aria-label="ตัวเลือกเพิ่มเติม">
        <Icon.Dots className="st-iconbtn__icon" />
      </button>

      {open && (
        <div className="st-menu__panel st-menu__panel--wide">
          <button type="button" className="st-menu__item" onClick={() => { onEdit(); setOpen(false); }}>
            <Icon.Pencil className="st-menu__itemicon" /> แก้ไขข้อมูล
          </button>
          <button type="button" className="st-menu__item" onClick={() => { onResetPassword(); setOpen(false); }}>
            <Icon.Key className="st-menu__itemicon" /> รีเซ็ตรหัสผ่าน
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const [userModal, setUserModal] = useState({ open: false, data: null });
  const [passwordModal, setPasswordModal] = useState({ open: false, data: null });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "ผู้ดูแลระบบ (Admin)",
    username: "admin_pos",
    email: "admin@cafepos.com",
    phone: "089-999-8888",
  });

  const [storeData, setStoreData] = useState({
    name: "ร้านกาแฟคราฟต์ & เบเกอรี่",
    taxId: "0105560000000",
    phone: "081-234-5678",
    address: "123/45 ถนนมิตรภาพ อ.เมือง จ.ขอนแก่น 40000",
    vatRate: "7",
  });
  const [isDirty, setIsDirty] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleActive = (id, value) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: value } : u)));
    showToast("อัปเดตสถานะผู้ใช้งานเรียบร้อยแล้ว");
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fullName = formData.get("fullName");
    const username = formData.get("username");
    const role = formData.get("role");

    if (userModal.data) {
      setUsers((prev) => prev.map((u) => (u.id === userModal.data.id ? { ...u, fullName, username, role } : u)));
      showToast("แก้ไขข้อมูลผู้ใช้งานสำเร็จ");
    } else {
      const newUser = { id: Date.now(), fullName, username, role, active: true };
      setUsers((prev) => [...prev, newUser]);
      showToast("เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว");
    }
    setUserModal({ open: false, data: null });
  };

  const handleResetPasswordSave = (e) => {
    e.preventDefault();
    showToast(`รีเซ็ตรหัสผ่านให้ ${passwordModal.data?.username} เรียบร้อยแล้ว`);
    setPasswordModal({ open: false, data: null });
  };

  const handleStoreChange = (field, value) => {
    setStoreData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveStore = () => {
    setIsDirty(false);
    showToast("บันทึกข้อมูลการตั้งค่าเรียบร้อยแล้ว");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast("อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว");
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    showToast("ออกจากระบบเรียบร้อยแล้ว");
  };

  const filteredUsers = users.filter(
    (u) => u.fullName.includes(searchQuery) || u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="st-container">
      {toast && <div className="st-toast">{toast}</div>}

      <div className="st-header">
        <h2 className="st-title">
          การตั้งค่า <span>Settings</span>
        </h2>
        <p className="st-subtitle">จัดการข้อมูลส่วนตัว ข้อมูลร้าน และสิทธิ์ผู้ใช้งาน</p>
      </div>

      <div className="st-layout">
        <aside className="st-tabs">
          <button
            type="button"
            className={`st-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <div>
              <span className="st-tab__label">จัดการโปรไฟล์</span>
              <span className="st-tab__sub">ข้อมูลส่วนตัว, รหัสผ่าน</span>
            </div>
          </button>

          <button
            type="button"
            className={`st-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <div>
              <span className="st-tab__label">ผู้ใช้งาน & สิทธิ์</span>
              <span className="st-tab__sub">ผู้ดูแลระบบ, แคชเชียร์</span>
            </div>
          </button>

          <button
            type="button"
            className={`st-tab ${activeTab === "store" ? "active" : ""}`}
            onClick={() => setActiveTab("store")}
          >
            <div>
              <span className="st-tab__label">ข้อมูลร้านค้า</span>
              <span className="st-tab__sub">ชื่อร้าน, ที่อยู่, เลขภาษี</span>
            </div>
          </button>

          <button
            type="button"
            className="st-tab st-tab--danger"
            onClick={() => setShowLogoutModal(true)}
          >
            <div>
              <span className="st-tab__label st-tab__label--danger">ออกจากระบบ</span>
              <span className="st-tab__sub">จบการทำงาน, สลับบัญชี</span>
            </div>
          </button>
        </aside>

        <main className="st-content">
          <div className="st-scroll">
            {activeTab === "profile" && (
              <div className="st-group">
                <div className="st-section-head">
                  <h3 className="st-section-title">จัดการโปรไฟล์ส่วนตัว</h3>
                  <p className="st-section-desc">แก้ไขข้อมูลบัญชีผู้ใช้และเปลี่ยนรหัสผ่านของคุณ</p>
                </div>

                <form onSubmit={handleSaveProfile} className="st-grid">
                  <div className="st-field full">
                    <label className="st-label">ชื่อ-นามสกุล <span className="st-req">*</span></label>
                    <input
                      type="text"
                      className="st-input"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="st-field">
                    <label className="st-label">ชื่อผู้ใช้ (Username)</label>
                    <input
                      type="text"
                      className="st-input"
                      value={profileData.username}
                      disabled
                    />
                  </div>

                  <div className="st-field">
                    <label className="st-label">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      className="st-input"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>

                  <div className="st-field full" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed var(--st-line)" }}>
                    <h4 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 700 }}>เปลี่ยนรหัสผ่าน</h4>
                  </div>

                  <div className="st-field">
                    <label className="st-label">รหัสผ่านปัจจุบัน</label>
                    <input type="password" className="st-input" placeholder="••••••••" />
                  </div>

                  <div className="st-field">
                    <label className="st-label">รหัสผ่านใหม่</label>
                    <input type="password" className="st-input" placeholder="อย่างน้อย 6 ตัวอักษร" />
                  </div>

                  <div className="st-field full" style={{ marginTop: "12px" }}>
                    <button type="submit" className="st-btn st-btn--solid">
                      บันทึกโปรไฟล์
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "users" && (
              <>
                <div className="st-section-head">
                  <h3 className="st-section-title">จัดการผู้ใช้งานและสิทธิ์</h3>
                  <p className="st-section-desc">เพิ่ม แก้ไข หรือกำหนดสิทธิ์การเข้าถึงระบบของพนักงาน</p>
                </div>

                <div className="st-toolbar">
                  <div className="st-toolbar__left">
                    <div className="st-search">
                      <Icon.Search className="st-search__icon" />
                      <input
                        type="text"
                        className="st-search__input st-input"
                        placeholder="ค้นหาชื่อ หรือชื่อผู้ใช้..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="st-toolbar__right">
                    <button
                      type="button"
                      className="st-btn st-btn--solid"
                      onClick={() => setUserModal({ open: true, data: null })}
                    >
                      <Icon.Plus /> เพิ่มผู้ใช้งาน
                    </button>
                  </div>
                </div>

                <div className="st-table__wrap">
                  <table className="st-table">
                    <thead>
                      <tr>
                        <th className="is-left">ชื่อ-นามสกุล</th>
                        <th className="is-left">ชื่อสำหรับเข้าสู่ระบบ</th>
                        <th>สิทธิ์</th>
                        <th>สถานะ</th>
                        <th className="is-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="is-left st-table__name">{u.fullName}</td>
                            <td className="is-left st-table__username">{u.username}</td>
                            <td>
                              <span className={`st-role ${u.role === "ADMIN" ? "is-admin" : ""}`}>
                                {u.role === "ADMIN" ? "ผู้ดูแลระบบ" : "แคชเชียร์"}
                              </span>
                            </td>
                            <td>
                              <ToggleSwitch
                                checked={u.active}
                                onChange={(value) => toggleActive(u.id, value)}
                              />
                            </td>
                            <td className="is-right">
                              <RowMenu
                                onEdit={() => setUserModal({ open: true, data: u })}
                                onResetPassword={() => setPasswordModal({ open: true, data: u })}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>
                            <div className="st-empty">
                              <div className="st-empty__icon"><Icon.Users /></div>
                              <p className="st-empty__title">ไม่พบข้อมูลผู้ใช้งาน</p>
                              <p className="st-empty__desc">ลองเปลี่ยนคำค้นหา หรือเพิ่มผู้ใช้งานใหม่</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === "store" && (
              <div className="st-group">
                <div className="st-section-head">
                  <h3 className="st-section-title">ข้อมูลร้านค้า</h3>
                  <p className="st-section-desc">ข้อมูลส่วนนี้จะถูกใช้อ้างอิงในเอกสารการขาย</p>
                </div>

                <div className="st-grid">
                  <div className="st-field full">
                    <label className="st-label">ชื่อร้านค้า <span className="st-req">*</span></label>
                    <input
                      type="text"
                      className="st-input"
                      value={storeData.name}
                      onChange={(e) => handleStoreChange("name", e.target.value)}
                    />
                  </div>

                  <div className="st-field">
                    <label className="st-label">เลขประจำตัวผู้เสียภาษี</label>
                    <input
                      type="text"
                      className="st-input"
                      value={storeData.taxId}
                      onChange={(e) => handleStoreChange("taxId", e.target.value)}
                    />
                  </div>

                  <div className="st-field">
                    <label className="st-label">เบอร์โทรศัพท์ร้าน</label>
                    <input
                      type="text"
                      className="st-input"
                      value={storeData.phone}
                      onChange={(e) => handleStoreChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="st-field full">
                    <label className="st-label">ที่อยู่ร้านค้า</label>
                    <textarea
                      className="st-textarea"
                      value={storeData.address}
                      onChange={(e) => handleStoreChange("address", e.target.value)}
                    />
                  </div>

                  <div className="st-field">
                    <label className="st-label">อัตราภาษีมูลค่าเพิ่ม (%)</label>
                    <div className="st-input-affix">
                      <input
                        type="number"
                        className="st-input"
                        value={storeData.vatRate}
                        onChange={(e) => handleStoreChange("vatRate", e.target.value)}
                      />
                      <span className="st-affix">%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeTab === "store" && (
            <div className={`st-savebar ${isDirty ? "dirty" : ""}`}>
              <div className="st-savebar__status">
                <span className="st-savebar__dot" />
                {isDirty ? "มีข้อมูลที่ยังไม่ได้บันทึก" : "บันทึกข้อมูลล่าสุดแล้ว"}
              </div>
              <div className="st-savebar__btns">
                <button
                  type="button"
                  className="st-btn st-btn--ghost"
                  disabled={!isDirty}
                  onClick={() => setIsDirty(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="st-btn st-btn--solid"
                  disabled={!isDirty}
                  onClick={handleSaveStore}
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {userModal.open && (
        <div className="st-modal-overlay">
          <div className="st-modal">
            <div className="st-modal__head">
              <h3 className="st-modal__title">
                {userModal.data ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
              </h3>
              <button
                type="button"
                className="st-modal__close"
                onClick={() => setUserModal({ open: false, data: null })}
              >
                <Icon.X />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="st-modal__body">
                <div className="st-grid">
                  <div className="st-field full">
                    <label className="st-label">ชื่อ-นามสกุล <span className="st-req">*</span></label>
                    <input
                      name="fullName"
                      type="text"
                      className="st-input"
                      defaultValue={userModal.data?.fullName || ""}
                      required
                    />
                  </div>
                  <div className="st-field full">
                    <label className="st-label">ชื่อผู้ใช้ (Username) <span className="st-req">*</span></label>
                    <input
                      name="username"
                      type="text"
                      className="st-input"
                      defaultValue={userModal.data?.username || ""}
                      required
                    />
                  </div>
                  {!userModal.data && (
                    <div className="st-field full">
                      <label className="st-label">รหัสผ่าน <span className="st-req">*</span></label>
                      <input
                        name="password"
                        type="password"
                        className="st-input"
                        required
                      />
                    </div>
                  )}
                  <div className="st-field full">
                    <label className="st-label">สิทธิ์การใช้งาน</label>
                    <select
                      name="role"
                      className="st-select"
                      defaultValue={userModal.data?.role || "CASHIER"}
                    >
                      <option value="CASHIER">แคชเชียร์ (Cashier)</option>
                      <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="st-modal__foot">
                <button
                  type="button"
                  className="st-btn st-btn--ghost"
                  onClick={() => setUserModal({ open: false, data: null })}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="st-btn st-btn--solid">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModal.open && (
        <div className="st-modal-overlay">
          <div className="st-modal st-modal--sm">
            <div className="st-modal__head">
              <h3 className="st-modal__title">รีเซ็ตรหัสผ่าน</h3>
              <button
                type="button"
                className="st-modal__close"
                onClick={() => setPasswordModal({ open: false, data: null })}
              >
                <Icon.X />
              </button>
            </div>
            <form onSubmit={handleResetPasswordSave}>
              <div className="st-modal__body">
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
                  กำลังรีเซ็ตรหัสผ่านให้กับบัญชี: <b>{passwordModal.data?.username}</b>
                </p>
                <div className="st-field">
                  <label className="st-label">รหัสผ่านใหม่ <span className="st-req">*</span></label>
                  <input type="password" className="st-input" required minLength={4} />
                </div>
              </div>
              <div className="st-modal__foot">
                <button
                  type="button"
                  className="st-btn st-btn--ghost"
                  onClick={() => setPasswordModal({ open: false, data: null })}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="st-btn st-btn--solid">
                  ยืนยันรหัสผ่านใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="st-modal-overlay">
          <div className="st-modal st-modal--sm">
            <div className="st-modal__head">
              <h3 className="st-modal__title">ออกจากระบบ</h3>
              <button
                type="button"
                className="st-modal__close"
                onClick={() => setShowLogoutModal(false)}
              >
                <Icon.X />
              </button>
            </div>
            <div className="st-modal__body" style={{ textAlign: "center", padding: "32px 24px" }}>
              <div className="st-logout-icon">
                <Icon.LogOut />
              </div>
              <h3 style={{ margin: "16px 0 8px", fontSize: "18px", fontWeight: 700, color: "var(--st-ink)" }}>
                ยืนยันการออกจากระบบ
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--st-muted)" }}>
                คุณต้องการออกจากระบบการทำงานปัจจุบันใช่หรือไม่?
              </p>
            </div>
            <div className="st-modal__foot">
              <button
                type="button"
                className="st-btn st-btn--ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="st-btn st-btn--danger"
                onClick={handleLogoutConfirm}
              >
                <Icon.LogOut /> ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}