import React, { useState, useEffect, useCallback } from 'react';
import './PromotionView.css';
import { listProducts, setProductStatus } from '../../api/products';

const CATEGORY_TO_NAV = { Coffee: 'coffee', Tea: 'tea', Bakery: 'snack' };

export default function MenuManagementView({ onOpenAddMenuModal, onEditMenu }) {
  const [menu, setMenu] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockOverrides, setStockOverrides] = useState({});
  const [stockModalItem, setStockModalItem] = useState(null);
  const [tempStockValue, setTempStockValue] = useState("");

  const load = useCallback(async () => {
    try {
      const page = await listProducts({ size: 200 });
      setMenu((page?.content ?? []).map((p) => ({
        id: p.id,
        category: CATEGORY_TO_NAV[p.category?.name] ?? 'coffee',
        name: p.name,
        price: p.price != null ? Number(p.price) : 0,
        imgSrc: p.imageUrl ?? null,
        kind: p.category?.name === 'Tea' ? 'tea' : p.category?.name === 'Bakery' ? 'snack' : '',
        isActive: p.active,
      })));
      setLoadError(null);
    } catch (err) {
      console.error('listProducts failed:', err);
      setLoadError(err?.message ?? 'โหลดเมนูไม่สำเร็จ');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const reload = () => load();
    window.addEventListener('products:reload', reload);
    return () => window.removeEventListener('products:reload', reload);
  }, [load]);

  const toggleStatus = async (id) => {
    const item = menu.find((m) => m.id === id);
    if (!item) return;
    setBusy(true);
    try {
      await setProductStatus(id, !item.isActive);
      await load();
    } catch (err) {
      console.error('setProductStatus failed:', err);
      alert(err?.message ?? 'เปลี่ยนสถานะไม่สำเร็จ');
    } finally { setBusy(false); }
  };

  const filteredMenu = menu.filter(item => categoryFilter === 'all' || item.category === categoryFilter);

  const getCategoryStyle = (cat) => {
    switch(cat) {
      case 'coffee': return { bg: '#fef3c7', color: '#92400e', label: 'กาแฟ' };
      case 'tea': return { bg: '#ecfdf5', color: '#059669', label: 'ชา' };
      case 'snack': return { bg: '#ffedd5', color: '#c2410c', label: 'ขนม' };
      default: return { bg: '#f3f4f6', color: '#4b5563', label: 'ทั่วไป' };
    }
  };

  const handleOpenStockModal = (item) => {
    setStockModalItem(item);
    const current = stockOverrides[item.id];
    setTempStockValue(current == null ? "" : String(current));
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm("ปิดการขายเมนูนี้ใช่หรือไม่?")) return;
    try {
      await setProductStatus(id, false);
      await load();
    } catch (err) {
      alert(err?.message ?? 'ปิดเมนูไม่สำเร็จ');
    }
  };

  const handleSaveStock = () => {
    const newStock = tempStockValue.trim() === "" ? null : Number(tempStockValue);
    setStockOverrides((prev) => ({ ...prev, [stockModalItem.id]: newStock }));
    setStockModalItem(null);
  };

  return (
    <div className="promo-view" style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>

      <header className="promo-header" style={{ alignItems: 'center', marginBottom: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between' }}>
        <div className="promo-header-info">
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            จัดการเมนู <span style={{ color: '#6b7280', fontSize: '16px' }}>(Menu Management)</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>จัดการรายการสินค้า ตั้งค่าราคา และเปิด/ปิดเมนูหน้าร้าน</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '300px' }}>
          <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '8px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="ค้นหาเมนู (Search menu)..." autoComplete="off" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }} />
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ id: 'all', label: 'ทั้งหมด (All)' }, { id: 'coffee', label: 'กาแฟ' }, { id: 'tea', label: 'ชา' }, { id: 'snack', label: 'ขนม' }].map(tab => (
            <button key={tab.id} onClick={() => setCategoryFilter(tab.id)} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e5e7eb', background: categoryFilter === tab.id ? '#111827' : '#fff', color: categoryFilter === tab.id ? '#fff' : '#4b5563', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onOpenAddMenuModal} style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          เพิ่มเมนูใหม่
        </button>
      </div>

      {loadError && <p style={{ color: '#ef4444', padding: '8px 0', flexShrink: 0 }}>{loadError}</p>}

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', flex: 1, overflowY: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, width: '30%' }}>สินค้า (Item)</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, width: '15%' }}>หมวดหมู่</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, width: '15%' }}>ราคา</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, width: '15%' }}>สต็อก (Stock)</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, width: '10%' }}>สถานะ</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, textAlign: 'right', width: '15%' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenu.length > 0 ? filteredMenu.map((item, index) => {
              const catStyle = getCategoryStyle(item.category);
              const stock = stockOverrides[item.id] ?? null;
              return (
                <tr key={item.id} style={{ borderBottom: index === filteredMenu.length - 1 ? 'none' : '1px solid #f3f4f6', opacity: item.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.imgSrc ? <img src={item.imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>☕️</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', marginBottom: '2px', textDecoration: item.isActive ? 'none' : 'line-through' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>SKU-{String(item.id).padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: catStyle.bg, color: catStyle.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{catStyle.label}</span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#374151' }}>฿ {item.price.toFixed(2)}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: stock === 0 ? '#ef4444' : '#374151' }}>
                    {stock != null ? `${stock} ชิ้น` : <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>ไม่จำกัด (∞)</span>}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <label className="toggle-switch" style={{ margin: 0, transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                      <input type="checkbox" checked={item.isActive} onChange={() => toggleStatus(item.id)} disabled={busy} />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => onEditMenu && onEditMenu(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="ตั้งค่าเมนู">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </button>
                      <button onClick={() => handleOpenStockModal(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="อัปเดตสต็อก">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      </button>
                      <button onClick={() => handleDeleteMenu(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="ลบเมนู">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>ไม่พบรายการเมนูในหมวดหมู่นี้</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {stockModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#111827' }}>อัปเดตสต็อก</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>{stockModalItem.name}</p>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: '8px' }}>จำนวนสต็อก (เว้นว่าง = มีของตลอด)</label>
            <input type="number" value={tempStockValue} onChange={(e) => setTempStockValue(e.target.value)} placeholder="เช่น 20" autoComplete="off" autoFocus style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '24px', fontSize: '14px', outline: 'none', background: '#fff', color: '#111827' }} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setStockModalItem(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSaveStock} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>อัปเดตสต็อก</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
