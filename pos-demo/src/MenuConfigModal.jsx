import React, { useState } from "react";
import "./MenuConfigModal.css"; 

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
      roasts: [{ id: 'medium', label: 'คั่วกลาง (Medium Roast)', desc: 'Nutty, Caramel, Balanced acidity', active: true }, { id: 'dark', label: 'คั่วเข้ม (Dark Roast)', desc: 'Bold, Smokey, Dark Chocolate', active: false }],
      sweetness: [{ label: '100%', active: true }, { label: '75%', active: true }, { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }],
      addonIds: ['shot'] 
    };
  }
};

const CheckIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
);

export default function MenuConfigModal({ item, onClose, onSave, globalAddons = [], onAddGlobalAddon }) {
  const [config, setConfig] = useState(item.config || GET_DEFAULT_CONFIG(item.category));
  
  // 👉 เพิ่ม State สำหรับเก็บค่า "ชื่อเมนู" และ "ราคา" ที่ถูกแก้ไข
  const [editedName, setEditedName] = useState(item.name);
  const [editedPrice, setEditedPrice] = useState(item.price);
  
  const [showPrompt, setShowPrompt] = useState(null); 
  const [promptData, setPromptData] = useState({ name: '', desc: '', price: '' });

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

  const openPrompt = (type) => {
    setPromptData({ name: '', desc: '', price: '' });
    setShowPrompt(type);
  };

  const submitPrompt = () => {
    if (!promptData.name) return;

    if (showPrompt === 'roast') {
      const newRoast = { id: Date.now().toString(), label: promptData.name, desc: promptData.desc, active: true };
      setConfig({ ...config, roasts: [...config.roasts, newRoast] });
    } else if (showPrompt === 'addon') {
      const newGlobalAddon = { 
        id: 'addon_' + Date.now(), 
        label: promptData.name, 
        desc: promptData.desc || `+${promptData.name}`, 
        price: parseInt(promptData.price) || 0, 
        isActive: true,
        category: item.category 
      };
      
      if (onAddGlobalAddon) onAddGlobalAddon(newGlobalAddon); 
      setConfig({ ...config, addonIds: [...(config.addonIds || []), newGlobalAddon.id] });
    }
    setShowPrompt(null);
  };

  // 👉 อัปเดตฟังก์ชัน Save ให้ส่ง "ชื่อใหม่" กลับไปด้วย
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
  const activeAddonsCount = (config.addonIds || []).length;

  const filteredGlobalAddons = globalAddons.filter(addon => 
    addon.category === 'all' || addon.category === item.category
  );

  return (
    <div className="config-overlay">
      <div className="config-modal" style={{ position: 'relative' }}>
        
        {/* --- Header --- */}
        <header className="config-header">
          <div className="config-header-info" style={{ width: '100%' }}>
            <div className="config-img-box">
              {item.imgSrc ? <><img src={item.imgSrc} alt={item.name} /><div className="config-img-badge">CONFIG</div></> : <><div className="config-img-fallback">{item.category === 'tea' ? 'Tea' : item.category === 'snack' ? 'Snack' : 'Espresso'}</div><div className="config-img-badge">CONFIG</div></>}
            </div>
            <div style={{ flex: 1 }}>
              
              {/* 👉 แก้ไขให้ชื่อเมนูเป็น Input Field ที่พิมพ์ได้ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="text" 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  title="คลิกเพื่อแก้ไขชื่อเมนู"
                  style={{ 
                    fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#111827', 
                    background: '#f9fafb', border: '1px dashed #9ca3af', borderRadius: '6px', 
                    padding: '2px 8px', outline: 'none', width: '100%', maxWidth: '280px' 
                  }}
                />
                <span className="config-badge">{item.category === 'coffee' ? 'Coffee Bar' : item.category === 'tea' ? 'Tea Menu' : 'Snack'}</span>
                <span className="config-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>Config Mode</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Base Price: 
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '8px', color: '#047857', fontWeight: 700 }}>฿</span>
                    {/* 👉 ช่องราคา */}
                    <input 
                      type="number" 
                      value={editedPrice} 
                      onChange={(e) => setEditedPrice(e.target.value)} 
                      title="คลิกเพื่อแก้ไขราคาตั้งต้น"
                      style={{ 
                        width: '70px', padding: '2px 8px 2px 20px', borderRadius: '6px', 
                        border: '1px dashed #10b981', background: '#ecfdf5', color: '#047857', 
                        fontWeight: 700, outline: 'none', fontSize: '14px' 
                      }} 
                    />
                  </div>
                </span>
                <span style={{ color: '#d1d5db' }}>•</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  โครงสร้างตัวเลือกเมนู (Menu Options Config) - สำหรับกำหนดตัวเลือกที่แสดงหน้าแคชเชียร์
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="config-close-btn"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>

        {/* --- Body --- */}
        <div className="config-body">
          
          {(item.category === 'coffee' || item.category === 'tea') && (
            <section>
              <div className="config-section-head">
                <span className="config-label">รูปแบบเครื่องดื่ม / SERVING TYPE <span style={{ color: '#059669', fontWeight: 'normal', fontSize: '12px' }}>* (เลือกประเภทที่เปิดขาย)</span></span>
                <span className="config-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>เปิดใช้งาน {activeServing}/{config.serving.length}</span>
              </div>
              <div className="config-grid-3">
                {config.serving.map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => toggleActive('serving', idx)} 
                    className={`config-toggle-btn ${s.active ? 'active' : ''}`}
                    style={{ justifyContent: 'center' }} 
                  >
                    {s.active && <div style={{width:'16px', height:'16px', color:'#10b981'}}><CheckIcon /></div>}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {item.category === 'coffee' && (
            <section>
              <div className="config-section-head">
                <span className="config-label">เมล็ดกาแฟ / ROAST PROFILE <span style={{ color: '#059669', fontWeight: 'normal', fontSize: '12px' }}>* (เลือกระดับการคั่วที่เปิดบริการ)</span></span>
                <span className="config-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>เปิดใช้งาน {activeRoasts}/{config.roasts.length}</span>
              </div>
              <div className="config-grid-3">
                {config.roasts.map((r, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => toggleActive('roasts', idx)} 
                    className={`config-toggle-btn config-roast-card ${r.active ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div className={`config-radio ${r.active ? 'checked' : ''}`}>
                         {r.active && <div style={{width:'10px', height:'10px', backgroundColor:'#10b981', borderRadius: '50%'}}></div>}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{r.label}</span>
                    </div>
                    <span className="roast-desc">{r.desc}</span>
                  </button>
                ))}
                
                {/* ปุ่มเพิ่มเมล็ดกาแฟ */}
                <button onClick={() => openPrompt('roast')} className="config-toggle-btn config-add-btn" style={{ minHeight: '60px', borderStyle: 'dashed', justifyContent: 'center', display: 'flex', gap: '8px' }}>
                  <PlusIcon /><span style={{ color: '#374151', fontSize: '14px' }}>+ เพิ่มเมล็ดกาแฟ</span>
                </button>
              </div>
            </section>
          )}

          {(item.category === 'coffee' || item.category === 'tea') && (
            <section>
              <div className="config-section-head">
                <span className="config-label">ระดับความหวาน / SWEETNESS LEVEL <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '12px' }}>(กำหนดระดับความหวานที่เปิดให้สั่ง)</span></span>
                <span className="config-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>เปิด {activeSweetness} ระดับ</span>
              </div>
              <div className="config-flex-wrap" style={{ display: 'flex', gap: '12px' }}>
                {config.sweetness.map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => toggleActive('sweetness', idx)} 
                    className={`config-toggle-btn ${s.active ? 'active' : ''}`} 
                    style={{ flex: 1, padding: '0.75rem 0', justifyContent: 'center' }}
                  >
                    {s.active && <div style={{width:'16px', height:'16px', color:'#10b981', display: 'none'}}><CheckIcon /></div>}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="config-section-head">
              <span className="config-label">ตัวเลือกเพิ่มเติม / ADD-ONS <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '12px' }}>(ผูกท็อปปิ้งหรือส่วนผสมเสริม)</span></span>
              <span className="config-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>เปิดใช้งาน {activeAddonsCount} รายการ</span>
            </div>
            
            <div className="config-grid-3">
              {filteredGlobalAddons.map(addon => {
                const isLinked = (config.addonIds || []).includes(addon.id);
                return (
                  <div 
                    key={addon.id} 
                    onClick={() => toggleGlobalAddon(addon.id)} 
                    className={`config-addon-card ${isLinked ? 'active' : ''}`}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between', 
                        padding: '16px', 
                        border: isLinked ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: isLinked ? '#ecfdf5' : '#fff',
                        minHeight: '104px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <div>
                        <div className="config-addon-title" style={{ fontSize: '15px', fontWeight: 700, color: addon.isActive ? (isLinked ? '#111827' : '#4b5563') : '#ef4444', marginBottom: '4px' }}>
                          {addon.label} {!addon.isActive && '(หมด)'}
                        </div>
                        <div className="config-addon-desc" style={{ fontSize: '13px', color: '#6b7280' }}>{addon.desc}</div>
                      </div>
                      
                      <div className={`config-checkbox ${isLinked ? 'checked' : ''}`} style={{ borderColor: isLinked ? '#10b981' : '#d1d5db', backgroundColor: isLinked ? '#10b981' : 'transparent', flexShrink: 0 }}>
                        {isLinked && <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>ราคาเพิ่ม</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: addon.price === 0 ? '#10b981' : '#111827' }}>
                        {addon.price > 0 ? `+฿${addon.price}` : <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '4px' }}>Free (+฿0)</span>}
                      </span>
                    </div>
                  </div>
                )
              })}
              
              <button 
                onClick={() => openPrompt('addon')} 
                className="config-toggle-btn config-add-btn" 
                style={{ minHeight: '104px', borderStyle: 'dashed', flexDirection: 'column', justifyContent: 'center', display: 'flex', gap: '4px' }}
              >
                <PlusIcon />
                <span style={{ color: '#111827', fontSize: '14px', fontWeight: 700 }}>+ เพิ่ม Add-on ใหม่</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>กำหนดชื่อและราคาเสริม</span>
              </button>
            </div>
          </section>
        </div>

        {/* --- Footer --- */}
        <footer className="config-footer" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
            ยกเลิก (Cancel)
          </button>
          <button onClick={handleSave} style={{ background: '#059669', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '100px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            บันทึกการตั้งค่า (Save Configuration)
          </button>
        </footer>

        {/* --- Custom Inner Pop-up สำหรับสร้าง Add-on ใหม่ --- */}
        {showPrompt && (
          <div className="prompt-overlay">
            <div className="prompt-modal">
              <h3 className="prompt-title">
                {showPrompt === 'roast' ? 'เพิ่มระดับการคั่ว' : 'เพิ่ม Add-on ใหม่'}
              </h3>
              
              <div className="prompt-field">
                <label>ชื่อ{showPrompt === 'roast' ? 'ระดับการคั่ว' : ' Add-on'}:</label>
                <input 
                  type="text" placeholder={showPrompt === 'roast' ? "เช่น คั่วอ่อน" : "เช่น นมโอ๊ต"}
                  value={promptData.name} onChange={e => setPromptData({...promptData, name: e.target.value})}
                />
              </div>

              <div className="prompt-field">
                <label>คำอธิบายย่อ:</label>
                <input 
                  type="text" placeholder={showPrompt === 'roast' ? "เช่น Fruity, Floral" : "เช่น +Oat Milk"}
                  value={promptData.desc} onChange={e => setPromptData({...promptData, desc: e.target.value})}
                />
              </div>

              {showPrompt === 'addon' && (
                <div className="prompt-field">
                  <label>ราคาที่บวกเพิ่ม (฿):</label>
                  <input 
                    type="number" placeholder="เช่น 15 (ใส่ 0 ถ้าฟรี)"
                    value={promptData.price} onChange={e => setPromptData({...promptData, price: e.target.value})}
                  />
                </div>
              )}

              <div className="prompt-actions">
                <button className="prompt-btn-close" onClick={() => setShowPrompt(null)}>ยกเลิก</button>
                <button className="prompt-btn-submit" onClick={submitPrompt}>เพิ่มรายการ</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}