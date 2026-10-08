import React, { useState } from 'react';

// Props-based view: PosScreen owns the data (menu/handlers) and passes it in.
// Backend wiring lives in PosScreen's handleToggleMenuStatus / handleUpdateMenuStock / etc.
export default function MenuManagementView({ menuItems = [], onToggleStatus, onDeleteMenu, onOpenAddMenuModal, onEditMenu, onUpdateStock }) {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [stockModalItem, setStockModalItem] = useState(null);
  const [tempStockValue, setTempStockValue] = useState("");

  const filteredMenu = menuItems.filter(item => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const getCategoryStyle = (cat) => {
    switch(cat) {
      case 'coffee': return { bg: '#fef3c7', color: '#92400e', label: 'กาแฟ' };
      case 'tea': return { bg: '#ecfdf5', color: '#059669', label: ' ชา' };
      case 'snack': return { bg: '#ffedd5', color: '#c2410c', label: ' ขนม' };
      default: return { bg: '#f3f4f6', color: '#4b5563', label: 'ทั่วไป' };
    }
  };

  const handleOpenStockModal = (item) => {
    setStockModalItem(item);
    setTempStockValue(item.stock == null ? "" : item.stock.toString());
  };

  const handleSaveStock = () => {
    const newStock = tempStockValue.trim() === "" ? null : Number(tempStockValue);
    if (onUpdateStock) {
      onUpdateStock(stockModalItem.id, newStock);
    }
    setStockModalItem(null);
  };

  return (
    <div className="promo-view" style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <style>{`
        .clean-search-input {
          background-color: #ffffff !important;
          color: #111827 !important;
          -webkit-box-shadow: 0 0 0 30px white inset !important;
        }
        .clean-search-input::placeholder {
          color: #9ca3af !important;
        }
      `}</style>

      <header className="promo-header" style={{ alignItems: 'center', marginBottom: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between' }}>
        <div className="promo-header-info">
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            จัดการเมนู <span style={{color: '#6b7280', fontSize: '16px'}}>(Menu Management)</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            จัดการรายการสินค้า ตั้งค่าราคา และเปิด/ปิดเมนูหน้าร้าน
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '300px' }}>
            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="ค้นหาเมนู (Search menu)..." 
              className="clean-search-input"
              autoComplete="off"
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            <select style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: '#111827', cursor: 'pointer' }}>
               <option value="ACTIVE">เปิดใช้งาน (Active)</option>
               <option value="INACTIVE">ปิดใช้งาน (Inactive)</option>
            </select>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'ทั้งหมด (All)' },
            { id: 'coffee', label: 'กาแฟ' },
            { id: 'tea', label: 'ชา' },
            { id: 'snack', label: 'ขนม' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              style={{ 
                padding: '8px 16px', borderRadius: '20px', border: '1px solid #e5e7eb', 
                background: categoryFilter === tab.id ? '#111827' : '#fff', 
                color: categoryFilter === tab.id ? '#fff' : '#4b5563', 
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 👉 ปรับสีปุ่ม "เพิ่มเมนูใหม่" เป็น #00694b ตามปุ่ม Add-on */}
        <button 
          onClick={onOpenAddMenuModal} 
          style={{ 
            background: '#00694b', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '10px', 
            fontSize: '14px', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer', 
            boxShadow: '0 4px 6px -1px rgba(0, 105, 75, 0.2)' 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          เพิ่มเมนูใหม่
        </button>
      </div>

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
              const isLast = index === filteredMenu.length - 1;
              
              return (
                <tr key={item.id} style={{ borderBottom: isLast ? 'none' : '1px solid #f3f4f6', transition: 'background 0.2s', opacity: item.isActive ? 1 : 0.5 }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.imgSrc ? (
                          <img src={item.imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: item.isActive ? 1 : 0.5 }} />
                        ) : (
                          <span style={{ fontSize: '20px' }}>☕️</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', marginBottom: '2px', textDecoration: item.isActive ? 'none' : 'line-through' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>SKU-{item.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: catStyle.bg, color: catStyle.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      {catStyle.label}
                    </span>
                  </td>

                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#374151' }}>
                    ฿ {item.price.toFixed(2)}
                  </td>

                  <td style={{ padding: '16px 24px', fontWeight: 600, color: item.stock === 0 ? '#ef4444' : '#374151' }}>
                    {item.stock != null ? `${item.stock} ชิ้น` : <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>ไม่จำกัด (∞)</span>}
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <label className="toggle-switch" style={{ margin: 0, transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                      <input type="checkbox" checked={item.isActive} onChange={() => onToggleStatus(item.id)} />
                      <span className="slider"></span>
                    </label>
                  </td>

                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      
                      <button onClick={() => onEditMenu && onEditMenu(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="ตั้งค่า/แก้ไขเมนู">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </button>

                      <button onClick={() => handleOpenStockModal(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="อัปเดตสต็อก">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      </button>
                      
                      <button onClick={() => onDeleteMenu && onDeleteMenu(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="ลบเมนู">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>

                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>ไม่พบรายการเมนูในหมวดหมู่นี้</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {stockModalItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
               <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#111827' }}>อัปเดตสต็อก</h3>
               <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{stockModalItem.name}</p>
            </div>
            
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: '8px' }}>
              จำนวนสต็อก (เว้นว่าง = มีของตลอด)
            </label>
            
            <input 
              type="number" 
              value={tempStockValue}
              onChange={(e) => setTempStockValue(e.target.value)}
              placeholder="เช่น 20"
              autoComplete="off"
              className="clean-search-input"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '24px', fontSize: '14px', outline: 'none' }}
              autoFocus
            />
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setStockModalItem(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSaveStock} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#00694b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>อัปเดตสต็อก</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}