import React, { useState } from "react";

const GET_DEFAULT_CONFIG = (category) => {
  if (category === 'tea') {
    return {
      serving: [{ id: 'iced', label: 'เย็น (Iced)', price: 0, active: true }, { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true }, { id: 'frappe', label: 'ปั่น (Frappe +฿15)', price: 15, active: true }],
      sweetness: [{ label: '100%', active: true }, { label: '75%', active: true }, { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }],
      roasts: [], addonIds: ['boba', 'jelly'] 
    };
  } else if (category === 'snack') {
    return {
      serving: [], sweetness: [], roasts: [], addonIds: []
    };
  } else {
    return {
      serving: [{ id: 'iced', label: 'เย็น (Iced)', price: 0, active: true }, { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true }, { id: 'frappe', label: 'ปั่น (Frappe +฿15)', price: 15, active: true }],
      roasts: [{ id: 'medium', label: 'คั่วกลาง (Medium Roast)', desc: 'Nutty, Caramel, Balanced acidity', active: true }, { id: 'dark', label: 'คั่วเข้ม (Dark Roast)', desc: 'Bold, Smokey, Dark Chocolate', active: true }],
      sweetness: [{ label: '100%', active: true }, { label: '75%', active: true }, { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }],
      addonIds: ['shot', 'whip', 'jelly', 'oatmilk'] 
    };
  }
};

const CheckIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
);

const PlusIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
);

export default function MenuConfigModal({ item, onClose, onSave, globalAddons = [], onAddGlobalAddon }) {
  const [config, setConfig] = useState(item.config || GET_DEFAULT_CONFIG(item.category));
  const [editedName, setEditedName] = useState(item.name);
  const [editedPrice, setEditedPrice] = useState(item.price);
  
  const toggleActive = (category, index) => {
    const newArr = [...config[category]];
    newArr[index].active = !newArr[index].active;
    setConfig({ ...config, [category]: newArr });
  };

  const toggleGlobalAddon = (addonId) => {
    const currentIds = config.addonIds || [];
    if (currentIds.includes(addonId)) {
      setConfig({ ...config, addonIds: currentIds.filter(id => id !== addonId) });
    } else {
      setConfig({ ...config, addonIds: [...currentIds, addonId] });
    }
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      alert("กรุณากรอกชื่อเมนู");
      return;
    }
    if (onSave) onSave(item.id, { config, price: Number(editedPrice), name: editedName });
  };

  const activeServing = config.serving?.filter(s => s.active).length || 0;
  const activeRoasts = config.roasts?.filter(r => r.active).length || 0;
  const activeSweetness = config.sweetness?.filter(s => s.active).length || 0;
  
  const filteredGlobalAddons = globalAddons.filter(addon => 
    addon.category === 'all' || addon.category === item.category
  );
  
  const activeAddonsCount = filteredGlobalAddons.filter(addon => (config.addonIds || []).includes(addon.id)).length;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '24px' }}>
      
      <style>{`
        .edit-modal-container {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          font-family: 'Prompt', sans-serif;
          overflow: hidden;
        }
        .edit-modal-header {
          padding: 24px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .edit-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        .edit-modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .edit-section {
          margin-bottom: 32px;
        }
        .edit-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 12px;
        }
        .edit-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 4px 0;
        }
        .edit-section-subtitle {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
          font-weight: 400;
        }
        .edit-badge {
          background: #ecfdf5;
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .edit-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .edit-grid-auto {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .edit-option-btn {
          border: 1px solid #e5e7eb;
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .edit-option-btn.active {
          border-color: #10b981;
          color: #059669;
          background: #ecfdf5;
        }
        .edit-addon-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s;
          cursor: pointer;
          min-height: 110px;
        }
        .edit-addon-card.active {
          border-color: #10b981;
        }
        /* Toggle Switch CSS */
        .custom-toggle {
          position: relative;
          width: 44px;
          height: 24px;
          background-color: #e5e7eb;
          border-radius: 24px;
          transition: 0.3s;
        }
        .custom-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .custom-toggle.active {
          background-color: #10b981;
        }
        .custom-toggle.active::after {
          transform: translateX(20px);
        }

        /* 👇 CSS พิเศษสำหรับป้องกันพื้นหลังสีเทา */
        .clean-input {
            background-color: #ffffff !important; 
            color: #111827 !important;
            -webkit-box-shadow: 0 0 0 30px white inset !important;
        }
      `}</style>

      <div className="edit-modal-container">
        
        {/* --- Header --- */}
        <header className="edit-modal-header">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', background: '#ecfdf5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 9h13a3 3 0 0 1 0 6h-1" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9" /></svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#111827' }}>แก้ไขข้อมูลเมนู <span style={{color: '#6b7280', fontWeight: 500}}>(Edit Menu Item)</span></h2>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>SKU-{item.id.toString().padStart(4, '0')}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>กำหนดชื่อเมนู ราคาเริ่มต้น และตั้งค่าตัวเลือกการสั่งซื้อสำหรับระบบ POS หน้าร้าน</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* --- Body --- */}
        <div className="edit-modal-body custom-scrollbar">
          
          {/* 1. Basic Info (Name & Price) */}
          <div className="edit-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>ชื่อเมนู (ITEM NAME) <span style={{color: '#10b981'}}>*</span></label>
              
              {/* 👇 ปรับการรับค่า Input ที่นี่ */}
              <input 
                type="text" 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                autoComplete="off"
                className="clean-input"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', fontWeight: 700, outline: 'none' }}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0 0' }}>ชื่อที่จะแสดงบนใบเสร็จและหน้าจอรับออเดอร์</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>ราคาเริ่มต้น (BASE PRICE) <span style={{color: '#10b981'}}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#111827' }}>฿</span>
                
                {/* 👇 ปรับการรับค่า Input ที่นี่ */}
                <input 
                  type="number" 
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  autoComplete="off"
                  className="clean-input"
                  style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', fontWeight: 700, outline: 'none' }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#059669', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                ราคาปกติก่อนคำนวณส่วนเสริม (Add-ons)
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '0 0 32px 0' }} />

          {/* 2. SERVING TYPE */}
          {(item.category === 'coffee' || item.category === 'tea') && (
            <div className="edit-section">
              <div className="edit-section-header">
                <div>
                  <h3 className="edit-section-title">รูปแบบการเสิร์ฟ (SERVING TYPE) <span style={{color: '#10b981'}}>*</span></h3>
                  <p className="edit-section-subtitle">เลือกประเภทเครื่องดื่มที่เปิดขายหน้าร้าน</p>
                </div>
                <span className="edit-badge">เปิดใช้งาน {activeServing}/{config.serving.length}</span>
              </div>
              <div className="edit-grid-3">
                {config.serving.map((s, idx) => (
                  <button key={idx} onClick={() => toggleActive('serving', idx)} className={`edit-option-btn ${s.active ? 'active' : ''}`}>
                    {s.active && <CheckIcon />} <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. ROAST PROFILE */}
          {item.category === 'coffee' && (
            <div className="edit-section">
              <div className="edit-section-header">
                <div>
                  <h3 className="edit-section-title">ระดับการคั่วเมล็ดกาแฟ (ROAST PROFILE) <span style={{color: '#10b981'}}>*</span></h3>
                  <p className="edit-section-subtitle">เลือกระดับการคั่วที่เปิดให้บริการสำหรับเมนูนี้</p>
                </div>
                <span className="edit-badge">เปิดใช้งาน {activeRoasts}/{config.roasts.length}</span>
              </div>
              <div className="edit-grid-3">
                {config.roasts.map((r, idx) => (
                  <button key={idx} onClick={() => toggleActive('roasts', idx)} className={`edit-option-btn ${r.active ? 'active' : ''}`}>
                    {r.active && <CheckIcon />} <span>{r.label}</span>
                  </button>
                ))}
                <button className="edit-option-btn" style={{ borderStyle: 'dashed' }}>
                  <PlusIcon /> <span>เพิ่มเมล็ดกาแฟ</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. SWEETNESS LEVEL */}
          {(item.category === 'coffee' || item.category === 'tea') && (
            <div className="edit-section">
              <div className="edit-section-header">
                <div>
                  <h3 className="edit-section-title">ระดับความหวาน (SWEETNESS LEVEL)</h3>
                  <p className="edit-section-subtitle">กำหนดระดับความหวานที่ลูกค้าสามารถเลือกได้</p>
                </div>
                <span className="edit-badge">เปิด {activeSweetness} ระดับ</span>
              </div>
              <div className="edit-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
                {config.sweetness.map((s, idx) => (
                  <button key={idx} onClick={() => toggleActive('sweetness', idx)} className={`edit-option-btn ${s.active ? 'active' : ''}`}>
                    {s.active && <CheckIcon />} <span>{s.label}</span>
                  </button>
                ))}
                <button className="edit-option-btn" style={{ borderStyle: 'dashed' }}>
                  <PlusIcon /> <span>เพิ่มระดับ</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. ADD-ONS */}
          <div className="edit-section" style={{ marginBottom: 0 }}>
            <div className="edit-section-header">
              <div>
                <h3 className="edit-section-title">ตัวเลือกเพิ่มเติม / ท็อปปิ้ง (ADD-ONS & OPTIONS)</h3>
                <p className="edit-section-subtitle">เปิด/ปิดการขายท็อปปิ้งและส่วนผสมเสริมหน้าร้าน</p>
              </div>
              <span className="edit-badge">เปิดใช้งาน {activeAddonsCount}/{filteredGlobalAddons.length} รายการ</span>
            </div>
            
            <div className="edit-grid-3">
              {filteredGlobalAddons.map(addon => {
                const isLinked = (config.addonIds || []).includes(addon.id);
                return (
                  <div key={addon.id} onClick={() => toggleGlobalAddon(addon.id)} className={`edit-addon-card ${isLinked ? 'active' : ''}`} style={{ opacity: addon.isActive ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{addon.label}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{addon.desc} {addon.isActive ? '' : '(ปิดขาย)'}</div>
                      </div>
                      
                      <div className={`custom-toggle ${isLinked ? 'active' : ''}`}></div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>ราคาเพิ่ม</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: addon.price === 0 ? '#10b981' : '#111827' }}>
                        {addon.price > 0 ? `+฿${addon.price}` : <span style={{ color: '#059669' }}>ฟรี (+฿0)</span>}
                      </span>
                    </div>
                  </div>
                )
              })}
              
              <div className="edit-addon-card" style={{ borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: '4px', cursor: 'default' }}>
                <div style={{ color: '#10b981' }}><PlusIcon /></div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>เพิ่ม Add-on ใหม่</span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>กำหนดชื่อและราคาเสริม</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- Footer --- */}
        <footer className="edit-modal-footer">
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            ยกเลิก (Cancel)
          </button>
          <button onClick={handleSave} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '100px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
            <CheckIcon />
            บันทึกการตั้งค่า (Save Configuration)
          </button>
        </footer>

      </div>
    </div>
  );
}