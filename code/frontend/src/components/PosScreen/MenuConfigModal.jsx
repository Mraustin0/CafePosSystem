import React, { useState } from "react";

const GET_DEFAULT_CONFIG = (category) => {
  if (category === 'tea') {
    return {
      serving: [{ id: 'iced', label: 'เย็น (Iced)', price: 0, active: true }, { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true }, { id: 'frappe', label: 'ปั่น  +฿15', price: 15, active: true }],
      sweetness: [{ label: '125%', active: true }, { label: '100%', active: true }, { label: '75%', active: true }, { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }],
      roasts: [], addonIds: ['boba', 'jelly']
    };
  } else if (category === 'snack') {
    return {
      serving: [], sweetness: [], roasts: [], addonIds: []
    };
  } else {
    return {
      serving: [{ id: 'iced', label: 'เย็น (Iced)', price: 0, active: true }, { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true }, { id: 'frappe', label: 'ปั่น +฿15', price: 15, active: true }],
      roasts: [{ id: 'medium', label: 'คั่วกลาง (Medium Roast)', desc: 'Nutty, Caramel, Balanced acidity', active: true }, { id: 'dark', label: 'คั่วเข้ม (Dark Roast)', desc: 'Bold, Smokey, Dark Chocolate', active: true }],
      sweetness: [{ label: '125%', active: true }, { label: '100%', active: true }, { label: '75%', active: true }, { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }],
      addonIds: ['shot', 'whip', 'jelly', 'oatmilk']
    };
  }
};

const CheckIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
);


const ensure125 = (cfg) => {
  if (!cfg.sweetness?.length) return cfg;
  if (cfg.sweetness.some(s => s.label === '125%')) return cfg;
  return { ...cfg, sweetness: [{ label: '125%', active: true }, ...cfg.sweetness] };
};

export default function MenuConfigModal({ item, onClose, onSave, globalAddons = [], onAddGlobalAddon }) {
  const [config, setConfig] = useState(ensure125(item.config || GET_DEFAULT_CONFIG(item.category)));

  const toggleActive = (category, index) => {
    const newArr = [...config[category]];
    newArr[index].active = !newArr[index].active;
    setConfig({ ...config, [category]: newArr });
  };

  const handleSave = () => {
    if (onSave) onSave(item.id, { config, price: item.price, name: item.name, category: item.category });
  };

  const activeServing = config.serving?.filter(s => s.active).length || 0;
  const activeRoasts = config.roasts?.filter(r => r.active).length || 0;
  const activeSweetness = config.sweetness?.filter(s => s.active).length || 0;

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
        
        /* 👇 อัปเดต CSS Header ใหม่ */
        .edit-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
        }

        .edit-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        /* 👇 อัปเดต CSS Footer ใหม่ */
        .edit-modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          justify-content: flex-end; /* เลื่อนปุ่มไปขวา */
          gap: 12px;
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
        .edit-addon-card--add:hover {
          border-color: #00694b;
          background: rgba(0, 105, 75, 0.04);
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

        .clean-input {
            background-color: #ffffff !important; 
            color: #111827 !important;
            -webkit-box-shadow: 0 0 0 30px white inset !important;
        }
      `}</style>

      <div className="edit-modal-container">
        
        {/* --- Header --- */}
        <header className="edit-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#004f37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>
              EP
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#111827' }}>
                แก้ไขข้อมูลเมนู <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '15px' }}>(Edit Menu Item)</span>
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: 400, marginTop: '2px' }}>
                ตั้งค่าตัวเลือกสำหรับเมนู {item.name.toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {/* --- Body --- */}
        <div className="edit-modal-body custom-scrollbar">
          
          {/* 2. SERVING TYPE */}
          {(item.category === 'coffee' || item.category === 'tea') && (
            <div className="edit-section">
              <div className="edit-section-header">
                <div>
                  <h3 className="edit-section-title">รูปแบบการเสิร์ฟ (SERVING TYPE) <span style={{color: '#ef4444'}}>*</span></h3>
                  
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
                  <h3 className="edit-section-title">ระดับการคั่วเมล็ดกาแฟ (ROAST PROFILE) <span style={{color: '#ef4444'}}>*</span></h3>
                </div>
                <span className="edit-badge">เปิดใช้งาน {activeRoasts}/{config.roasts.length}</span>
              </div>
              <div className="edit-grid-3">
                {config.roasts.map((r, idx) => (
                  <button key={idx} onClick={() => toggleActive('roasts', idx)} className={`edit-option-btn ${r.active ? 'active' : ''}`}>
                    {r.active && <CheckIcon />} <span>{r.label}</span>
                  </button>
                ))}
                
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
               
              </div>
            </div>
          )}

        </div>

        {/* --- Footer (ย้ายปุ่มมาด้านขวา) --- */}
        <footer className="edit-modal-footer">
          <button onClick={onClose} style={{ background: '#ffffff', border: '1px solid #d1d5db', color: '#4b5563', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>
            ยกเลิก
          </button>
          <button onClick={handleSave} style={{ background: '#00694b', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 105, 75, 0.2)' }}>
            บันทึกการตั้งค่า
          </button>
        </footer>

      </div>

    </div>
  );
}