import React, { useState } from 'react';

export default function AddonManagementView({ addons, onToggleStatus, onAddAddon, onEditAddon, onDeleteAddon }) {
  // --- 1. State สำหรับฟอร์มเพิ่มข้อมูล ---
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('all'); 

  // --- 2. State สำหรับ Modals และเก็บข้อมูลที่จะแก้ไข ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('all');

  // --- Handlers ---
  const handleSaveNew = () => {
    if (!name) return alert("กรุณากรอกชื่อ Add-on");
    onAddAddon({
      id: 'addon_' + Date.now(),
      label: name,
      desc: desc || `+${name}`,
      price: parseInt(price) || 0,
      isActive: true,
      category: category 
    });
    setIsAdding(false);
    setName(''); setDesc(''); setPrice(''); setCategory('all');
  };

  const handleOpenEdit = (addon) => {
    setSelectedAddon(addon);
    setEditName(addon.label);
    setEditDesc(addon.desc.startsWith('+') && addon.desc === `+${addon.label}` ? '' : addon.desc);
    setEditPrice(addon.price);
    setEditCategory(addon.category || 'all');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editName) return alert("กรุณากรอกชื่อ Add-on");
    if (onEditAddon) {
      onEditAddon({
        ...selectedAddon, 
        label: editName,
        desc: editDesc || `+${editName}`,
        price: parseInt(editPrice) || 0,
        category: editCategory
      });
    }
    setIsEditModalOpen(false);
    setSelectedAddon(null);
  };

  const handleOpenDelete = (addon) => {
    setSelectedAddon(addon);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteAddon) onDeleteAddon(selectedAddon.id);
    setIsDeleteModalOpen(false);
    setSelectedAddon(null);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* --- CSS เพิ่มเติมสำหรับ Modal Animations และแก้สี Input --- */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center; z-index: 1300;
        }
        .custom-modal-card {
          background: #fff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          animation: modalFadeIn 0.2s ease-out forwards;
        }
        .clean-input-addon {
          background-color: #ffffff !important;
          color: #111827 !important;
          -webkit-box-shadow: 0 0 0 30px white inset !important;
        }
        .clean-input-addon:focus {
          border-color: #10b981 !important;
          outline: none !important;
        }
      `}</style>

      {/* --- Header --- */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>
            จัดการท็อปปิ้งส่วนกลาง <span style={{color: '#6b7280', fontSize: '18px'}}>(Global Add-ons)</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            สร้างและจัดการตัวเลือกเสริม เปิด/ปิดที่เดียวอัปเดตทุกเมนูในร้าน
          </p>
        </div>

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            style={{ background: '#00694b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
            สร้างท็อปปิ้งใหม่
          </button>
        )}
      </header>

      {/* --- Add New Form (Collapsible) --- */}
      {isAdding && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>ชื่อ Add-on *</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="เช่น นมโอ๊ต" 
              className="clean-input-addon"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} 
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>คำอธิบายย่อ</label>
            <input 
              type="text" 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              placeholder="เช่น +Oat Milk" 
              className="clean-input-addon"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} 
            />
          </div>
          <div style={{ width: '120px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>ราคา (฿) *</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              placeholder="เช่น 15" 
              className="clean-input-addon"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} 
            />
          </div>
          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>สำหรับหมวดหมู่</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="clean-input-addon"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="all">ใช้ได้ทั้งหมด</option>
              <option value="coffee">กาแฟ (Coffee)</option>
              <option value="tea">ชา (Tea)</option>
              <option value="snack">ขนม (Snack)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsAdding(false)} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#4b5563', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>ยกเลิก</button>
            <button onClick={handleSaveNew} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#00694b', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>บันทึก</button>
          </div>
        </div>
      )}

      {/* --- Table --- */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600 }}>ชื่อท็อปปิ้ง (Add-on)</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600 }}>หมวดหมู่</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600 }}>ราคาบวกเพิ่ม</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>สถานะ (พร้อมขาย)</th>
              {/* 👇 ปรับ padding ขวาของคอลัมน์ จัดการ ให้กว้างขึ้น */}
              <th style={{ padding: '16px 48px 16px 24px', color: '#6b7280', fontWeight: 600, textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr 
                key={addon.id} 
                style={{ 
                  borderBottom: '1px solid #f3f4f6', 
                  transition: 'all 0.2s',
                  opacity: addon.isActive ? 1 : 0.4,
                  filter: addon.isActive ? 'none' : 'grayscale(100%)'
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{addon.label}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{addon.desc}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                   {addon.category === 'all' && <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>ทั่วไป</span>}
                   {addon.category === 'coffee' && <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>กาแฟ</span>}
                   {addon.category === 'tea' && <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>ชา</span>}
                   {addon.category === 'snack' && <span style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>ขนม</span>}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#047857' }}>
                  {addon.price > 0 ? `+ ฿ ${addon.price}` : 'Free'}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <label className="toggle-switch" style={{ margin: '0 auto', transform: 'scale(0.85)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={addon.isActive} onChange={() => onToggleStatus(addon.id)} />
                    <span className="slider"></span>
                  </label>
                </td>
                {/* 👇 ปรับ padding ขวาของแถวปุ่ม ให้ตรงกับ Header ด้านบน */}
                <td style={{ padding: '16px 48px 16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleOpenEdit(addon)} 
                      style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} 
                      title="แก้ไข"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(addon)} 
                      style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} 
                      title="ลบ"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {addons.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                  ยังไม่มีท็อปปิ้งในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card" style={{ width: '420px', padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>ลบท็อปปิ้ง? (Delete Add-on?)</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              คุณแน่ใจหรือไม่ว่าต้องการลบ <span style={{fontWeight: 700, color: '#374151'}}>'{selectedAddon?.label}'</span>?<br/> การกระทำนี้ไม่สามารถย้อนกลับได้ และจะมีผลกับทุกเมนูที่ใช้ท็อปปิ้งนี้
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', color: '#4b5563', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                ยกเลิก
              </button>
              <button onClick={handleConfirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"/></svg>
                ลบท็อปปิ้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {isEditModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-card" style={{ width: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </div>
                  <div>
                     <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#111827' }}>แก้ไขข้อมูลท็อปปิ้ง</h3>
                     <p style={{ fontSize: '14px', margin: 0, color: '#6b7280' }}>ปรับปรุงชื่อ ราคา และหมวดหมู่ของตัวเลือกเสริม</p>
                  </div>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                 <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>ชื่อ Add-on *</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="clean-input-addon"
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }} 
                  />
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>คำอธิบายย่อ</label>
                  <input 
                    type="text" 
                    value={editDesc} 
                    onChange={e => setEditDesc(e.target.value)} 
                    className="clean-input-addon"
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }} 
                  />
               </div>
               <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>ราคา (฿) *</label>
                    <input 
                      type="number" 
                      value={editPrice} 
                      onChange={e => setEditPrice(e.target.value)} 
                      className="clean-input-addon"
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>สำหรับหมวดหมู่</label>
                    <select 
                      value={editCategory} 
                      onChange={e => setEditCategory(e.target.value)} 
                      className="clean-input-addon"
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', background: '#fff', cursor: 'pointer' }}
                    >
                      <option value="all">ใช้ได้ทั้งหมด</option>
                      <option value="coffee">กาแฟ (Coffee)</option>
                      <option value="tea">ชา (Tea)</option>
                    </select>
                  </div>
               </div>
            </div>
            
            <div style={{ padding: '20px 24px', background: '#ffffff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button 
                 onClick={() => setIsEditModalOpen(false)} 
                 style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#4b5563', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
               >
                 ยกเลิก
               </button>
               <button 
                 onClick={handleSaveEdit} 
                 style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#105e46', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
               >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  บันทึกการแก้ไข
               </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}