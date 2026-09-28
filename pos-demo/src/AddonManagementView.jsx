import React, { useState } from 'react';

export default function AddonManagementView({ addons, onToggleStatus, onAddAddon }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('all'); 

  const handleSave = () => {
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

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--gray-900)' }}>
            จัดการท็อปปิ้งส่วนกลาง <span>(Global Add-ons)</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>
            สร้างและจัดการตัวเลือกเสริม เปิด/ปิดที่เดียวอัปเดตทุกเมนูในร้าน
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(true)} 
          style={{ background: 'var(--green-600)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
        >
          + สร้างท็อปปิ้งใหม่
        </button>
      </header>

      {isAdding && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>ชื่อ Add-on *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น นมโอ๊ต" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff', color: '#111827' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>คำอธิบายย่อ</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="เช่น +Oat Milk" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff', color: '#111827' }} />
          </div>
          <div style={{ width: '120px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>ราคา (฿)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="เช่น 15" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff', color: '#111827' }} />
          </div>
          <div style={{ width: '150px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>สำหรับหมวดหมู่</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff', color: '#111827', cursor: 'pointer' }}>
              <option value="all">ใช้ได้ทั้งหมด</option>
              <option value="coffee">กาแฟ (Coffee)</option>
              <option value="tea">ชา (Tea)</option>
              <option value="snack">ขนม (Snack)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsAdding(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#e5e7eb', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
            <button onClick={handleSave} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>บันทึก</button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600 }}>ชื่อท็อปปิ้ง (Add-on)</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600 }}>หมวดหมู่</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600 }}>ราคาบวกเพิ่ม</th>
              <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>สถานะ (พร้อมขาย)</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.id} style={{ borderBottom: '1px solid #f3f4f6', opacity: addon.isActive ? 1 : 0.5 }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{addon.label}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{addon.desc}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                   {addon.category === 'all' && <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>ทั่วไป</span>}
                   {addon.category === 'coffee' && <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>กาแฟ</span>}
                   {addon.category === 'tea' && <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>ชา</span>}
                   {addon.category === 'snack' && <span style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>ขนม</span>}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#047857' }}>
                  {addon.price > 0 ? `+ ฿ ${addon.price}` : 'Free'}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <label className="toggle-switch" style={{ margin: '0 auto', transform: 'scale(0.85)' }}>
                    <input type="checkbox" checked={addon.isActive} onChange={() => onToggleStatus(addon.id)} />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}