import React, { useState } from 'react';
import './PromotionView.css';

const INITIAL_PROMOTIONS = [
  {
    id: 'promo-1',
    title: 'Member Special',
    code: 'MEMBER10',
    typeTag: '% ลด 10%',
    tagColor: 'dark',
    discountValue: '10%',
    condition: 'ยอดขั้นต่ำ ฿200',
    isActive: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  },
  {
    id: 'promo-2',
    title: 'ส่วนลดบิลใหญ่',
    code: 'SAVE50',
    typeTag: '฿ ลด ฿50',
    tagColor: 'green',
    discountValue: '฿50',
    condition: 'ขั้นต่ำ ฿500',
    isActive: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    )
  },
  {
    id: 'promo-3',
    title: 'ซื้อ 1 แถม 1 ชา/กาแฟ',
    code: 'B1G1',
    typeTag: '1+1 ซื้อ 1 แถม 1',
    tagColor: 'brown',
    discountValue: 'ฟรี 1 แก้ว',
    condition: 'เฉพาะหมวดเครื่องดื่ม',
    isActive: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    )
  },
  {
    id: 'promo-4',
    title: 'First Order Welcome',
    code: 'WELCOME20',
    typeTag: '% ลด 20%',
    tagColor: 'green',
    discountValue: '20%',
    condition: 'ไม่มีขั้นต่ำ',
    isActive: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  },
  {
    id: 'promo-5',
    title: 'Happy Hour ชา/กาแฟ',
    code: 'HAPPY15',
    typeTag: '% ลด 15%',
    tagColor: 'gray',
    discountValue: '15%',
    condition: '14:00 - 17:00',
    isActive: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    )
  }
];

import { useEffect, useCallback } from 'react';
import { listPromotions, setPromotionStatus, deletePromotion } from '../../api/promotions';

const STAR_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
function apiToPromo(p) {
  const v = Number(p.discountValue);
  const value = p.discountType === 'PERCENT' ? `${v}%` : `฿${v.toFixed(2)}`;
  const cond = p.minOrderAmount != null ? `ยอดขั้นต่ำ ฿${Number(p.minOrderAmount).toFixed(2)}` : 'ไม่มีขั้นต่ำ';
  const tag = p.discountType === 'PERCENT' ? `% ลด ${v}%` : `฿ ลด ฿${v.toFixed(2)}`;
  return {
    id: p.id,
    title: p.name,
    code: p.code,
    typeTag: tag,
    tagColor: p.discountType === 'PERCENT' ? 'dark' : 'green',
    discountValue: value,
    condition: cond,
    isActive: p.active,
    icon: STAR_ICON,
    // wire fields for edit
    _discountType: p.discountType,
    _discountValue: p.discountValue,
    _minOrderAmount: p.minOrderAmount,
    _active: p.active,
  };
}

export default function PromotionView({ onOpenAddPromoModal, onEditPromo }) {
  const [promotions, setPromotions] = useState([]);

  const load = useCallback(async () => {
    try {
      const rows = await listPromotions();
      setPromotions(rows.map(apiToPromo));
    } catch (err) {
      console.error('listPromotions failed:', err);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const reload = () => load();
    window.addEventListener('promotions:reload', reload);
    return () => window.removeEventListener('promotions:reload', reload);
  }, [load]);

  const toggleStatus = async (id) => {
    const promo = promotions.find((p) => p.id === id);
    if (!promo) return;
    try {
      await setPromotionStatus(id, !promo.isActive);
      await load();
    } catch (err) {
      console.error('setPromotionStatus failed:', err);
      alert(err?.message ?? 'เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const handleEdit = (promo) => {
    // Hand back an object shaped for AddPromotionModal's `initial` prop (see PosScreen wiring).
    if (onEditPromo) onEditPromo({
      id: promo.id, name: promo.title, code: promo.code,
      discountType: promo._discountType, discountValue: promo._discountValue,
      minOrderAmount: promo._minOrderAmount, active: promo._active,
    });
  };

  return (
    <div className="promo-view">
      
      {/* ---------------- Header & Toolbar ---------------- */}
      <header className="promo-header" style={{ alignItems: 'center' }}>
        <div className="promo-header-info">
          <h2>จัดการโปรโมชั่น <span>(Promotion Management)</span></h2>
        
        </div>

        {/* 👉 ย้าย Toolbar (Search + Filter) มาไว้ใน Header ฝั่งขวา */}
        <div className="promo-toolbar" style={{ margin: 0, alignItems: 'center' }}>
          
          {/* 👉 เปลี่ยนมาใช้คลาส pos-search pos-search--inline เพื่อให้ดึง CSS หน้าตาของกล่องค้นหาจากหน้าหลักมาใช้เลย! */}
          <div className="pos-search pos-search--inline" style={{ margin: '0 16px 0 0', maxWidth: '340px', width: '340px' }}>
            <svg className="pos-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="" />
          </div>
          
          <div className="promo-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            <select style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: 'var(--gray-900)', fontSize: '13px', cursor: 'pointer' }}>
               <option value="ACTIVE">เปิดใช้งาน (Active)</option>
               <option value="INACTIVE">ปิดใช้งาน (Inactive)</option>
            </select>
          </div>
        </div>
      </header>

      {/* ---------------- Grid ---------------- */}
      <div className="promo-grid">
        
        {/* Add Card */}
        <div className="promo-card promo-card--add" onClick={onOpenAddPromoModal}>
          <span className="promo-add-tag">New Campaign</span>
          <div className="promo-add-content">
            <div className="promo-add-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <h4>เพิ่มโปรโมชั่นใหม่</h4>
            <p>(คลิกเพื่อเปิดฟอร์ม)</p>
          </div>
        </div>

        {/* Existing Promo Cards */}
        {promotions.map(promo => (
          <div className={`promo-card ${!promo.isActive ? 'is-expired' : ''}`} key={promo.id}>
            
            <div className="promo-card__header">
              <div className="promo-card__title-area">
                <div className="promo-icon">{promo.icon}</div>
                <div>
                  <h3 className="promo-title">{promo.title}</h3>
                  <div className="promo-code">Code: <span>{promo.code}</span></div>
                </div>
              </div>
              <div className={`promo-type-tag tag-${promo.tagColor}`}>
                {promo.typeTag}
              </div>
            </div>

            <div className="promo-card__body">
              <div className="promo-val-col">
                <span className="promo-label">DISCOUNT VALUE</span>
                <span className="promo-value">{promo.discountValue}</span>
              </div>
              <div className="promo-cond-col">
                <span className="promo-label">CONDITIONS</span>
                <span className="promo-condition">{promo.condition}</span>
              </div>
            </div>

            <div className="promo-card__footer">
              <div className="promo-status">
                <label className="toggle-switch">
                  <input type="checkbox" checked={promo.isActive} onChange={() => toggleStatus(promo.id)} />
                  <span className="slider"></span>
                </label>
                <span className={`status-text ${promo.isActive ? 'active' : ''}`}>
                  {promo.isActive ? 'Active' : 'ปิดใช้งาน (Inactive)'}
                </span>
              </div>
              <div className="promo-actions">
                <button className="icon-btn" onClick={() => handleEdit(promo)} title="แก้ไขโปรโมชั่น">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}