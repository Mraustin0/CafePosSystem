import React, { useState } from 'react';

export default function MenuConfigModal({ item, onClose, onSave }) {
  if (!item) return null;

  // อ่าน config เดิม หรือสร้างค่าเริ่มต้น
  const [config, setConfig] = useState(() => {
    return item.config || {
      serving: [
        { id: 'iced', label: 'เย็น (Iced)', price: 0, active: true },
        { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true },
        { id: 'frappe', label: 'ปั่น (Frappe +฿15)', price: 15, active: true }
      ],
      roasts: [
        { id: 'medium', label: 'คั่วกลาง (Medium Roast)', desc: 'Nutty, Caramel, Balanced acidity', active: true },
        { id: 'dark', label: 'คั่วเข้ม (Dark Roast)', desc: 'Bold, Smokey, Dark Chocolate', active: true }
      ],
      sweetness: [
        { label: '125%', active: true },
        { label: '100%', active: true },
        { label: '75%', active: true },
        { label: '50%', active: true },
        { label: '25%', active: true },
        { label: '0%', active: true }
      ]
    };
  });

  const toggleServing = (id) => {
    setConfig(prev => ({
      ...prev,
      serving: prev.serving.map(s => s.id === id ? { ...s, active: !s.active } : s)
    }));
  };

  const toggleRoast = (id) => {
    setConfig(prev => ({
      ...prev,
      roasts: prev.roasts ? prev.roasts.map(r => r.id === id ? { ...r, active: !r.active } : r) : []
    }));
  };

  const toggleSweetness = (label) => {
    setConfig(prev => ({
      ...prev,
      sweetness: prev.sweetness.map(sw => sw.label === label ? { ...sw, active: !sw.active } : sw)
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...item,
        config: config
      });
    }
    onClose();
  };

  const activeServingCount = config.serving.filter(s => s.active).length;
  const activeRoastCount = config.roasts ? config.roasts.filter(r => r.active).length : 0;
  const activeSweetCount = config.sweetness.filter(s => s.active).length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
      
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#00694b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
              EP
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>แก้ไขข้อมูลเมนู <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 400 }}>(Edit Menu Item)</span></h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>ตั้งค่าตัวเลือกย่อยของเมนู {item.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* SERVING TYPE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>รูปแบบการเสิร์ฟ (SERVING TYPE) <span style={{ color: '#ef4444' }}>*</span></label>
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>เปิดใช้งาน {activeServingCount}/{config.serving.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {config.serving.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleServing(s.id)}
                  style={{
                    padding: '12px', borderRadius: '10px', border: s.active ? '1.5px solid #10b981' : '1px solid #d1d5db',
                    background: s.active ? '#ecfdf5' : '#fff', color: s.active ? '#047857' : '#6b7280',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  {s.active && <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ROAST PROFILE (เฉพาะกาแฟ) */}
          {config.roasts && config.roasts.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>ระดับการคั่วเมล็ดกาแฟ (ROAST PROFILE) <span style={{ color: '#ef4444' }}>*</span></label>
                <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>เปิดใช้งาน {activeRoastCount}/{config.roasts.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {config.roasts.map(r => (
                  <button
                    key={r.id}
                    onClick={() => toggleRoast(r.id)}
                    style={{
                      padding: '12px', borderRadius: '10px', border: r.active ? '1.5px solid #10b981' : '1px solid #d1d5db',
                      background: r.active ? '#ecfdf5' : '#fff', color: r.active ? '#047857' : '#6b7280',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    {r.active && <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SWEETNESS LEVEL */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block' }}>ระดับความหวาน (SWEETNESS LEVEL)</label>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>กำหนดระดับความหวานที่ลูกค้าสามารถเลือกได้</span>
              </div>
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>เปิด {activeSweetCount} ระดับ</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {config.sweetness.map(sw => (
                <button
                  key={sw.label}
                  onClick={() => toggleSweetness(sw.label)}
                  style={{
                    padding: '10px 0', borderRadius: '10px', border: sw.active ? '1.5px solid #10b981' : '1px solid #d1d5db',
                    background: sw.active ? '#ecfdf5' : '#fff', color: sw.active ? '#047857' : '#6b7280',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  {sw.active && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  {sw.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            ยกเลิก
          </button>
          <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#00694b', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,105,75,0.2)' }}>
            บันทึกการตั้งค่า
          </button>
        </div>

      </div>
    </div>
  );
}