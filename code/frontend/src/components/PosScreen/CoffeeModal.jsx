import React, { useState } from "react";
import "./AddNewItemModal.css";

const FALLBACK_CONFIG = {
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
    { label: '100%', active: true }, { label: '75%', active: true }, 
    { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }
  ],
  addonIds: ['shot', 'whip']
};

export default function CoffeeModal({ item, onClose, onAddToCart, globalAddons = [] }) {
  const config = item.config || FALLBACK_CONFIG;
  
  const activeServing = config.serving?.filter(s => s.active) || [];
  const activeRoasts = config.roasts?.filter(r => r.active) || [];
  const activeSweetness = config.sweetness?.filter(s => s.active) || [];
  
  // กรองเฉพาะ Addon ที่เมนูนี้ลิงก์ไว้และอยู่ในสถานะเปิดขาย
  const activeAddons = globalAddons.filter(a => 
    (config.addonIds || []).includes(a.id) && a.isActive
  );

  const [selectedServing, setSelectedServing] = useState(activeServing[0]?.id || null);
  const [selectedRoast, setSelectedRoast] = useState(activeRoasts[0]?.id || null);
  const [selectedSweetness, setSelectedSweetness] = useState("100%");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  const toggleAddon = (id) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleAddToCart = () => {
    const basePrice = item.price || 0;
    const servingData = activeServing.find(s => s.id === selectedServing);
    const servingPrice = servingData ? servingData.price : 0;
    
    let addonsPrice = 0;
    const addonDetails = [];
    selectedAddons.forEach(id => {
      const ad = activeAddons.find(a => a.id === id);
      if (ad) {
        addonsPrice += ad.price;
        addonDetails.push(ad.label);
      }
    });

    const finalPrice = (basePrice + servingPrice + addonsPrice) * quantity;
    const roastLabel = activeRoasts.find(r => r.id === selectedRoast)?.label.split(' ')[0] || "";
    const servingLabel = servingData ? servingData.label.split(' ')[0] : "";
    const detailString = `${servingLabel} • ${roastLabel} • หวาน ${selectedSweetness}`;
    const extrasString = addonDetails.length > 0 ? addonDetails.join(", ") : "ไม่มีเพิ่มเติม";

    onAddToCart({
      id: Date.now(),
      name: item.name,
      price: finalPrice / quantity, 
      qty: quantity,
      detail: detailString,
      extras: extrasString,
      note: note ? `โน้ต: ${note}` : "",
      isNew: true
    });
    
    onClose();
  };

  const currentBasePrice = item.price || 0;
  const currentServingPrice = activeServing.find(s => s.id === selectedServing)?.price || 0;
  let currentAddonPrice = 0;
  selectedAddons.forEach(id => {
    const ad = activeAddons.find(a => a.id === id);
    if (ad) currentAddonPrice += ad.price;
  });
  const currentTotalPrice = (currentBasePrice + currentServingPrice + currentAddonPrice) * quantity;

  return (
    <div className="add-modal-overlay" style={{ zIndex: 1100 }}>
      <div className="add-modal" style={{ maxWidth: '800px', backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden' }}>
        
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
               {item.imgSrc ? <img src={item.imgSrc} alt={item.name} style={{width:'100%', height:'100%', borderRadius:'12px', objectFit:'cover'}} /> : '☕️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#111827' }}>{item.name}</h2>
                <span style={{ fontSize: '11px', background: '#ffedd5', color: '#ea580c', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Espresso Bar</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ea580c' }}>Base Price: ฿{item.price}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="custom-scrollbar" style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          
          {activeServing.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>1. รูปแบบเครื่องดื่ม / SERVING TYPE <span style={{color: '#ea580c'}}>*</span></h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {activeServing.map(s => (
                  <button 
                    key={s.id} onClick={() => setSelectedServing(s.id)}
                    style={{ padding: '10px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: s.id === selectedServing ? 700 : 500, cursor: 'pointer', transition: '0.2s', background: s.id === selectedServing ? '#fff7ed' : '#fff', border: s.id === selectedServing ? '2px solid #f97316' : '1px solid #d1d5db', color: s.id === selectedServing ? '#ea580c' : '#4b5563' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeRoasts.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>2. เมล็ดกาแฟ / ROAST PROFILE</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {activeRoasts.map(r => (
                  <div key={r.id} onClick={() => setSelectedRoast(r.id)} style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', display: 'flex', gap: '12px', background: '#fff', border: r.id === selectedRoast ? '2px solid #f97316' : '1px solid #d1d5db' }}>
                    <input type="radio" checked={r.id === selectedRoast} readOnly style={{ accentColor: '#f97316', width: '20px', height: '20px', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{r.label}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSweetness.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', margin: 0, letterSpacing: '0.05em' }}>3. ระดับความหวาน / SWEETNESS LEVEL</h3>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ea580c' }}>{selectedSweetness === '100%' ? 'หวานปกติ (100%)' : selectedSweetness}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {activeSweetness.map(s => (
                  <button key={s.label} onClick={() => setSelectedSweetness(s.label)} style={{ flex: 1, padding: '12px 0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: '0.2s', background: s.label === selectedSweetness ? '#f97316' : '#fff', border: s.label === selectedSweetness ? '2px solid #f97316' : '1px solid #d1d5db', color: s.label === selectedSweetness ? '#fff' : '#4b5563' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAddons.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>4. ตัวเลือกเพิ่มเติม / ADD-ONS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeAddons.map(ad => (
                  <div key={ad.id} onClick={() => toggleAddon(ad.id)} style={{ padding: '16px', borderRadius: '12px', border: selectedAddons.includes(ad.id) ? '2px solid #f97316' : '1px solid #e5e7eb', background: selectedAddons.includes(ad.id) ? '#fff7ed' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={selectedAddons.includes(ad.id)} readOnly style={{ accentColor: '#f97316', width: '24px', height: '24px', borderRadius: '6px' }} />
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{ad.label} ({ad.desc})</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{ad.desc.replace('+', '')}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: ad.price === 0 ? '#10b981' : '#374151' }}>
                      {ad.price === 0 ? 'Free' : `+฿${ad.price}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>5. โน้ตพิเศษ / SPECIAL REQUESTS</h3>
            <textarea 
              value={note} onChange={(e) => setNote(e.target.value)} placeholder="ระบุข้อความเพิ่มเติมถึงบาริสต้า (เช่น แยกน้ำแข็ง, ขอแก้วสองชั้น)..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'none', height: '80px', fontFamily: 'inherit' }}
            />
          </div>

        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', background: '#fff', display: 'flex', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #d1d5db', borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', background: '#fff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg></button>
            <span style={{ width: '32px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', height: '40px', background: '#fff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" /></svg></button>
          </div>
          <button onClick={handleAddToCart} style={{ flex: 1, background: '#f97316', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)' }}>
            <span>เพิ่มลงรายการสั่งซื้อ</span>
            <span style={{ fontSize: '18px' }}>฿{currentTotalPrice}</span>
          </button>
        </div>

      </div>
    </div>
  );
}