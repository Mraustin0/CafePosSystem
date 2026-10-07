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
  Store: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="m2 7 1 12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2l1-12"/><path d="M2 7h20M12 7V3M2 7l3-4h14l3 4"/></svg>,
  Receipt: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>,
  Printer: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>,
  Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>,
};

/* ---------- Mock Data ---------- */
const INITIAL_USERS = [
  { id: 1, fullName: "สมชาย ใจดี", username: "Disksy", role: "ADMIN", active: true },
  { id: 2, fullName: "พลอย แสงดี", username: "Tinny", role: "CASHIER", active: true },
  { id: 3, fullName: "หนึ่ง จันทร์เพ็ญ", username: "Chommy", role: "CASHIER", active: true },
  { id: 4, fullName: "ทิพย์ วงศ์งาม", username: "Tzoey", role: "CASHIER", active: false },
];

const INITIAL_DEVICES = [
  { id: 1, name: "POS Thermal Printer 80mm", type: "เครื่องพิมพ์ใบเสร็จ", status: "online", connected: true },
  { id: 2, name: "Kitchen Barcode Printer", type: "เครื่องพิมพ์ห้องครัว", status: "offline", connected: false },
  { id: 3, name: "Cash Drawer RJ11", type: "ลิ้นชักเก็บเงิน", status: "online", connected: true },
];

/* ---------- Sub Components ---------- */
function StatusPill({ active, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div className="st-menu" ref={ref}>
      <button
        type="button"
        className={`st-tag ${active ? "st-tag--green" : "st-tag--orange"}`}
        onClick={() => setOpen((v) => !v)}
      >
        {active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        <Icon.Chevron className="st-tag__chevron" />
      </button>

      {open && (
        <div className="st-menu__panel">
          <button type="button" className="st-menu__item" onClick={() => { if (!active) onChange(true); setOpen(false); }}>
            <span className="st-menu__dot st-menu__dot--green" /> เปิดใช้งาน
          </button>
          <button
            type="button"
            className="st-menu__item"
            onClick={() => {
              if (active) {
                if (window.confirm("ระงับผู้ใช้นี้? ผู้ใช้จะเข้าสู่ระบบไม่ได้ทันที")) onChange(false);
              }
              setOpen(false);
            }}
          >
            <span className="st-menu__dot st-menu__dot--orange" /> ปิดใช้งาน
          </button>
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Modal States
  const [userModal, setUserModal] = useState({ open: false, data: null });
  const [passwordModal, setPasswordModal] = useState({ open: false, data: null });

  // Store Settings Form State
  const [storeData, setStoreData] = useState({
    name: "ร้านกาแฟคราฟต์ & เบเกอรี่",
    taxId: "0105560000000",
    phone: "081-234-5678",
    address: "123/45 ถนนมิตรภาพ อ.เมือง จ.ขอนแก่น 40000",
    vatRate: "7",
    receiptHeader: "ยินดีต้อนรับสู่ร้านกาแฟคราฟต์",
    receiptFooter: "ขอบคุณที่อุดหนุน โอกาสหน้าเชิญใหม่ค่ะ",
    paperSize: "80mm",
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
      // Edit
      setUsers((prev) => prev.map((u) => (u.id === userModal.data.id ? { ...u, fullName, username, role } : u)));
      showToast("แก้ไขข้อมูลผู้ใช้งานสำเร็จ");
    } else {
      // Add
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

  const filteredUsers = users.filter(
    (u) => u.fullName.includes(searchQuery) || u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="st-container">
      {/* Toast Notification */}
      {toast && <div className="st-toast">{toast}</div>}

      {/* Header */}
      <div className="st-header">
        <h2 className="st-title">
          การตั้งค่า <span>Settings</span>
        </h2>
        <p className="st-subtitle">จัดการข้อมูลร้าน สิทธิ์ผู้ใช้งาน ใบเสร็จ และการเชื่อมต่ออุปกรณ์</p>
      </div>

      {/* Main Layout */}
      <div className="st-layout">
        {/* Navigation Tabs */}
        <aside className="st-tabs">
          <button
            type="button"
            className={`st-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <div className="st-tab__icon"><Icon.Users /></div>
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
            <div className="st-tab__icon"><Icon.Store /></div>
            <div>
              <span className="st-tab__label">ข้อมูลร้านค้า</span>
              <span className="st-tab__sub">ชื่อร้าน, ที่อยู่, เลขภาษี</span>
            </div>
          </button>

          <button
            type="button"
            className={`st-tab ${activeTab === "receipt" ? "active" : ""}`}
            onClick={() => setActiveTab("receipt")}
          >
            <div className="st-tab__icon"><Icon.Receipt /></div>
            <div>
              <span className="st-tab__label">ใบเสร็จรับเงิน</span>
              <span className="st-tab__sub">ข้อความหัว/ท้าย, ขนาดกระดาษ</span>
            </div>
          </button>

          <button
            type="button"
            className={`st-tab ${activeTab === "devices" ? "active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <div className="st-tab__icon"><Icon.Printer /></div>
            <div>
              <span className="st-tab__label">อุปกรณ์ฮาร์ดแวร์</span>
              <span className="st-tab__sub">เครื่องพิมพ์, ลิ้นชักเก็บเงิน</span>
            </div>
          </button>
        </aside>

        {/* Content Area */}
        <main className="st-content">
          <div className="st-scroll">
            {/* TAB 1: USERS */}
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
                        className="st-search__input"
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
                              <StatusPill active={u.active} onChange={(value) => toggleActive(u.id, value)} />
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

            {/* TAB 2: STORE INFO */}
            {activeTab === "store" && (
              <div className="st-group">
                <div className="st-section-head">
                  <h3 className="st-section-title">ข้อมูลร้านค้า</h3>
                  <p className="st-section-desc">ข้อมูลส่วนนี้จะถูกใช้อ้างอิงในเอกสารการขายและใบเสร็จรับเงิน</p>
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

            {/* TAB 3: RECEIPT */}
            {activeTab === "receipt" && (
              <div className="st-split">
                <div>
                  <div className="st-section-head">
                    <h3 className="st-section-title">ตั้งค่าใบเสร็จรับเงิน</h3>
                    <p className="st-section-desc">ปรับแต่งข้อความและรูปแบบของใบเสร็จกระดาษความร้อน</p>
                  </div>

                  <div className="st-group">
                    <h4 className="st-group__title">ขนาดกระดาษพิมพ์</h4>
                    <div className="st-choices">
                      <button
                        type="button"
                        className={`st-choice ${storeData.paperSize === "80mm" ? "active" : ""}`}
                        onClick={() => handleStoreChange("paperSize", "80mm")}
                      >
                        <span className="st-choice__name">กระดาษ 80 mm</span>
                        <span className="st-choice__desc">ขนาดมาตรฐานสำหรับสลิป POS ร้านค้าทั่วไป</span>
                      </button>
                      <button
                        type="button"
                        className={`st-choice ${storeData.paperSize === "58mm" ? "active" : ""}`}
                        onClick={() => handleStoreChange("paperSize", "58mm")}
                      >
                        <span className="st-choice__name">กระดาษ 58 mm</span>
                        <span className="st-choice__desc">ขนาดกะทัดรัด สำหรับเครื่องพิมพ์พกพา</span>
                      </button>
                    </div>
                  </div>

                  <div className="st-group">
                    <h4 className="st-group__title">ข้อความในใบเสร็จ</h4>
                    <div className="st-grid">
                      <div className="st-field full">
                        <label className="st-label">ข้อความหัวใบเสร็จ (Header)</label>
                        <input
                          type="text"
                          className="st-input"
                          value={storeData.receiptHeader}
                          onChange={(e) => handleStoreChange("receiptHeader", e.target.value)}
                        />
                      </div>
                      <div className="st-field full">
                        <label className="st-label">ข้อความท้ายใบเสร็จ (Footer)</label>
                        <textarea
                          className="st-textarea"
                          value={storeData.receiptFooter}
                          onChange={(e) => handleStoreChange("receiptFooter", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Receipt Preview */}
                <aside className="st-aside">
                  <p className="st-preview__title">ตัวอย่างใบเสร็จ (Preview)</p>
                  <div className={`st-receipt ${storeData.paperSize === "58mm" ? "narrow" : ""}`}>
                    <div className="st-receipt__name">{storeData.name || "ชื่อร้านค้า"}</div>
                    <div className="st-receipt__small">{storeData.address}</div>
                    <div className="st-receipt__small">โทร: {storeData.phone}</div>
                    {storeData.taxId && <div className="st-receipt__small">เลขผู้เสียภาษี: {storeData.taxId}</div>}
                    
                    <hr />
                    <div className="st-receipt__tag">{storeData.receiptHeader}</div>
                    <hr />

                    <div className="st-receipt__line">
                      <span>1x อเมริกาโน่เย็น</span>
                      <span>65.00</span>
                    </div>
                    <div className="st-receipt__line">
                      <span>1x ครัวซองต์เนยสด</span>
                      <span>85.00</span>
                    </div>
                    <hr />
                    <div className="st-receipt__line bold">
                      <span>รวมทั้งสิ้น</span>
                      <span>150.00</span>
                    </div>
                    <div className="st-receipt__line muted">
                      <span>รวม VAT {storeData.vatRate}%</span>
                      <span>9.81</span>
                    </div>
                    <hr />
                    <div className="st-receipt__foot">{storeData.receiptFooter}</div>
                  </div>
                </aside>
              </div>
            )}

            {/* TAB 4: DEVICES */}
            {activeTab === "devices" && (
              <>
                <div className="st-section-head">
                  <h3 className="st-section-title">อุปกรณ์ฮาร์ดแวร์</h3>
                  <p className="st-section-desc">ตรวจสอบสถานะการเชื่อมต่อเครื่องพิมพ์และอุปกรณ์ต่อพ่วง</p>
                </div>

                <div className="st-device-grid">
                  {INITIAL_DEVICES.map((dev) => (
                    <div key={dev.id} className={`st-device-card ${dev.connected ? "connected" : ""}`}>
                      <div className="st-device-card__icon">
                        <Icon.Printer />
                      </div>
                      <div className="st-device-card__info">
                        <div className="st-device-card__name">{dev.name}</div>
                        <div className="st-device-card__status">
                          <span className={`st-status-dot ${dev.status}`} />
                          {dev.connected ? "พร้อมใช้งาน" : "ไม่ได้เชื่อมต่อ"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom Save Bar (แสดงเมื่อมีการเปลี่ยนแปลงข้อมูลร้าน) */}
          {(activeTab === "store" || activeTab === "receipt") && (
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

      {/* ---------- MODAL: ADD / EDIT USER ---------- */}
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

      {/* ---------- MODAL: RESET PASSWORD ---------- */}
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
    </div>
  );
}