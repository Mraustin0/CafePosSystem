import React, { useEffect, useMemo, useRef, useState } from "react";
import "./UserManagementView.css";
import UserModal, { ROLE_OPTIONS } from "./UserModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const ROLE_FILTERS = [{ key: "all", label: "ทั้งหมด" }, ...ROLE_OPTIONS];

const fullName = (u) => `${u.firstName} ${u.lastName}`;

const nextEmployeeCode = (users) => {
  const max = users.reduce((m, u) => {
    const n = parseInt(String(u.code).replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `EMP-${String(max + 1).padStart(3, "0")}`;
};

/**
 * UserManagementView — จัดการพนักงาน (นำปุ่มกุญแจเปลี่ยนรหัสผ่านออก)
 */
export default function UserManagementView({
  users = [],
  onSaveUser,
  onDeleteUser,
  onToggleStatus,
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [userModal, setUserModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);
  const showNotice = (msg) => {
    setNotice(msg);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2800);
  };
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const roleCounts = useMemo(() => {
    const counts = { all: users.length };
    users.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [users]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return [fullName(u), u.username, u.code].join(" ").toLowerCase().includes(q);
    });
  }, [users, search, roleFilter]);

  const activeAdminCount = users.filter((u) => u.role === "admin" && u.status === "active").length;
  const isLastActiveAdmin = (u) => u.role === "admin" && u.status === "active" && activeAdminCount <= 1;

  /* ---------- Handlers ---------- */
  const handleToggle = (u) => {
    if (isLastActiveAdmin(u)) return showNotice("ต้องมี Admin ที่ใช้งานได้อย่างน้อย 1 คน");
    onToggleStatus?.(u.id);
  };

  const handleDeleteClick = (u) => {
    if (isLastActiveAdmin(u)) return showNotice("ไม่สามารถลบ Admin คนสุดท้ายของระบบได้");
    setDeleteTarget(u);
  };

  const confirmDelete = () => {
    onDeleteUser?.(deleteTarget.id);
    showNotice(`ลบพนักงาน ${fullName(deleteTarget)} แล้ว`);
    setDeleteTarget(null);
  };

  const handleSaveUser = (data) => {
    const editing = userModal?.user;

    if (editing && isLastActiveAdmin(editing) && (data.role !== "admin" || data.status !== "active")) {
      return "ไม่สามารถเปลี่ยนบทบาทหรือปิดใช้งาน Admin คนสุดท้ายของระบบได้";
    }

    const record = editing
      ? { ...editing, ...data }
      : { 
          ...data, 
          id: Date.now(), 
          code: nextEmployeeCode(users), 
          credentialSet: true 
        };

    onSaveUser?.(record);
    showNotice(editing ? "บันทึกการแก้ไขแล้ว" : `เพิ่มพนักงาน ${fullName(record)} แล้ว`);
    setUserModal(null);
    return null;
  };

  return (
    <div className="um-container">
      {/* ---------- Header ---------- */}
      <header className="um-header">
        <div>
          <h2 className="um-title">
            จัดการพนักงาน <span>(User Management)</span>
          </h2>
          <p className="um-subtitle">เพิ่ม แก้ไข กำหนดบทบาท และจัดการข้อมูลพนักงาน</p>
        </div>

        <label className="um-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อพนักงาน / Username..."
            autoComplete="off"
          />
        </label>
      </header>

      {/* ---------- Filter bar ---------- */}
      <div className="um-filterbar">
        <div className="um-pills" role="tablist" aria-label="กรองตามบทบาท">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={roleFilter === r.key}
              className={`um-pill ${roleFilter === r.key ? "active" : ""}`}
              onClick={() => setRoleFilter(r.key)}
            >
              {r.label}
              <span className="um-pill__count">{roleCounts[r.key] || 0}</span>
            </button>
          ))}
        </div>

        <button type="button" className="um-add-btn" onClick={() => setUserModal({ user: null })}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          เพิ่มพนักงานใหม่
        </button>
      </div>

      {/* ---------- Table ---------- */}
      <div className="um-table-card">
        <table className="um-table">
          <thead>
            <tr>
              <th>รหัสพนักงาน</th>
              <th>ชื่อ-นามสกุล</th>
              <th>Username</th>
              <th>บทบาท</th>
              <th className="col-status">สถานะ</th>
              <th className="col-actions">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => {
              const isActive = u.status === "active";
              const roleMeta = ROLE_OPTIONS.find((r) => r.key === u.role);
              return (
                <tr key={u.id} className={isActive ? "" : "is-inactive"}>
                  <td><span className="um-code">{u.code}</span></td>
                  <td>
                    <div className="um-person">
                      <span className="um-avatar" aria-hidden="true">{u.firstName.charAt(0)}</span>
                      <span className="um-name">{fullName(u)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="um-username">{u.username}</span>
                  </td>
                  <td><span className={`um-role um-role--${u.role}`}>{roleMeta?.label || u.role}</span></td>
                  <td className="col-status">
                    <span className="um-status">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        aria-label={`สถานะของ ${fullName(u)}`}
                        className={`um-toggle ${isActive ? "on" : ""}`}
                        onClick={() => handleToggle(u)}
                      />
                      <span className={`um-status__label ${isActive ? "on" : ""}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="um-actions">
                      <button type="button" className="um-iconbtn" title="แก้ไข" aria-label={`แก้ไข ${fullName(u)}`} onClick={() => setUserModal({ user: u })}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button type="button" className="um-iconbtn um-iconbtn--danger" title="ลบ" aria-label={`ลบ ${fullName(u)}`} onClick={() => handleDeleteClick(u)}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="um-empty">
                  {users.length === 0 ? "ยังไม่มีพนักงานในระบบ" : "ไม่พบพนักงานที่ตรงกับเงื่อนไข"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="um-foot">แสดง {visibleUsers.length} จากทั้งหมด {users.length} คน</div>

      {/* ---------- Modals ---------- */}
      {userModal && (
        <UserModal
          user={userModal.user}
          nextCode={nextEmployeeCode(users)}
          existingUsers={users}
          onSave={handleSaveUser}
          onClose={() => setUserModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="ลบพนักงาน? (Delete Employee?)"
          itemName={fullName(deleteTarget)}
          description="บัญชีนี้จะไม่สามารถเข้าสู่ระบบได้อีก และการกระทำนี้ไม่สามารถย้อนกลับได้"
          confirmText="ลบพนักงาน"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {notice && <div className="um-notice" role="status">{notice}</div>}
    </div>
  );
}