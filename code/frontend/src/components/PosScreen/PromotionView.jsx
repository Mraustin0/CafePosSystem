import { useState, useEffect, useCallback, useMemo } from 'react';
import './PromotionView.css';
import { listPromotions, setPromotionStatus, deletePromotion } from '../../api/promotions';

const STAR_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function formatValue(promo) {
  const v = Number(promo.discountValue ?? 0);
  return promo.discountType === 'PERCENT' ? `${v}%` : `฿${v.toFixed(2)}`;
}
function formatTag(promo) {
  const v = Number(promo.discountValue ?? 0);
  return promo.discountType === 'PERCENT' ? `% ลด ${v}%` : `฿ ลด ฿${v.toFixed(2)}`;
}
function formatCondition(promo) {
  if (promo.minOrderAmount == null) return 'ไม่มีขั้นต่ำ';
  return `ยอดขั้นต่ำ ฿${Number(promo.minOrderAmount).toFixed(2)}`;
}
function tagColorFor(promo) {
  return promo.discountType === 'PERCENT' ? 'dark' : 'green';
}

export default function PromotionView({ onOpenAddPromoModal, onEditPromo }) {
  const [promotions, setPromotions] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = useCallback(async () => {
    try {
      const rows = await listPromotions();
      setPromotions(rows);
      setLoadError(null);
    } catch (err) {
      console.error('listPromotions failed:', err);
      setLoadError(err?.message ?? 'โหลดโปรโมชั่นไม่สำเร็จ');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Expose reload so parent can call it after add/edit — via window event for now to avoid prop-drill.
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('promotions:reload', handler);
    return () => window.removeEventListener('promotions:reload', handler);
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promotions.filter((p) => {
      if (statusFilter === 'ACTIVE' && !p.active) return false;
      if (statusFilter === 'INACTIVE' && p.active) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    });
  }, [promotions, search, statusFilter]);

  const toggleStatus = async (promo) => {
    setBusy(true);
    try {
      await setPromotionStatus(promo.id, !promo.active);
      await load();
    } catch (err) {
      console.error('setPromotionStatus failed:', err);
      alert(err?.message ?? 'เปลี่ยนสถานะไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (promo) => {
    if (!window.confirm(`ลบโปรโมชั่น "${promo.name}" (${promo.code}) ?`)) return;
    setBusy(true);
    try {
      await deletePromotion(promo.id);
      await load();
    } catch (err) {
      console.error('deletePromotion failed:', err);
      alert(err?.message ?? 'ลบไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="promo-view">
      <header className="promo-header" style={{ alignItems: 'center' }}>
        <div className="promo-header-info">
          <h2>จัดการโปรโมชั่น <span>(Promotion Management)</span></h2>
        </div>

        <div className="promo-toolbar" style={{ margin: 0, alignItems: 'center' }}>
          <div className="pos-search pos-search--inline" style={{ margin: '0 16px 0 0', maxWidth: '340px', width: '340px' }}>
            <svg className="pos-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="ค้นหาโค้ด/ชื่อโปรโมชั่น" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="promo-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            <select style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: 'var(--gray-900)', fontSize: '13px', cursor: 'pointer' }}
                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">ทั้งหมด (All)</option>
              <option value="ACTIVE">เปิดใช้งาน (Active)</option>
              <option value="INACTIVE">ปิดใช้งาน (Inactive)</option>
            </select>
          </div>
        </div>
      </header>

      {loadError && <p style={{ color: '#c0392b', padding: '0 24px' }}>{loadError}</p>}

      <div className="promo-grid">
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

        {visible.map((promo) => (
          <div className={`promo-card ${!promo.active ? 'is-expired' : ''}`} key={promo.id}>
            <div className="promo-card__header">
              <div className="promo-card__title-area">
                <div className="promo-icon">{STAR_ICON}</div>
                <div>
                  <h3 className="promo-title">{promo.name}</h3>
                  <div className="promo-code">Code: <span>{promo.code}</span></div>
                </div>
              </div>
              <div className={`promo-type-tag tag-${tagColorFor(promo)}`}>
                {formatTag(promo)}
              </div>
            </div>

            <div className="promo-card__body">
              <div className="promo-val-col">
                <span className="promo-label">DISCOUNT VALUE</span>
                <span className="promo-value">{formatValue(promo)}</span>
              </div>
              <div className="promo-cond-col">
                <span className="promo-label">CONDITIONS</span>
                <span className="promo-condition">{formatCondition(promo)}</span>
              </div>
            </div>

            <div className="promo-card__footer">
              <div className="promo-status">
                <label className="toggle-switch">
                  <input type="checkbox" checked={promo.active} onChange={() => toggleStatus(promo)} disabled={busy} />
                  <span className="slider"></span>
                </label>
                <span className={`status-text ${promo.active ? 'active' : ''}`}>
                  {promo.active ? 'Active' : 'ปิดใช้งาน (Inactive)'}
                </span>
              </div>
              <div className="promo-actions">
                <button className="icon-btn" onClick={() => onEditPromo && onEditPromo(promo)} title="แก้ไข" disabled={busy}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button className="icon-btn" onClick={() => remove(promo)} title="ลบ" disabled={busy}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {visible.length === 0 && !loadError && (
          <div style={{ gridColumn: '1 / -1', padding: 32, textAlign: 'center', color: '#666' }}>
            ยังไม่มีโปรโมชั่นในรายการ — กด "เพิ่มโปรโมชั่นใหม่" เพื่อสร้าง
          </div>
        )}
      </div>
    </div>
  );
}
