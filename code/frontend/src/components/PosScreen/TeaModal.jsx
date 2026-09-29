import React, { useState } from "react";
import "./AddNewItemModal.css"; // หรือไฟล์ CSS ที่ใช้จัดการหน้าต่าง Modal นี้

// โครงสร้างสำรอง กรณีแอดมินยังไม่เคยกดเซ็ต Config เมนูชานี้
const FALLBACK_TEA_CONFIG = {
  serving: [
    { id: 'iced', label: 'เย็น (Iced)', price: 0, active: true },
    { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true },
    { id: 'frappe', label: 'ปั่น (Frappe +฿15)', price: 15, active: true }
  ],
  sweetness: [
    { label: '100%', active: true }, { label: '75%', active: true }, 
    { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }
  ],
  addonIds: ['boba', 'jelly', 'pudding'] // สำรองให้มีไข่มุก บุก พุดดิ้ง
};

// 👉 รับ props globalAddons มาเพื่อเทียบเช็คสถานะท็อปปิ้ง
export default function TeaModal({ item, onClose, onAddToCart, globalAddons = [] }) {
  // ดึง Config ที่แอดมินตั้งไว้ ถ้าไม่มีให้ใช้ตัวสำรอง
  const config = item.config || FALLBACK_TEA_CONFIG;
  
  // กรองเอาเฉพาะ Serving และ Sweetness ที่แอดมินเปิด "Active" ไว้ มาใช้งาน
  const activeServing = config.serving?.filter(s => s.active) || [];
  const activeSweetness = config.sweetness?.filter(s => s.active) || [];
  
  // 👉 หัวใจสำคัญ: กรอง Add-ons จากถังกลาง โดยเอาเฉพาะที่ 
  // 1. เมนูนี้ตั้งค่าผูกไว้ (อยู่ใน config.addonIds)
  // 2. สถานะในถังกลาง ต้อง "เปิดขายอยู่" (a.isActive === true)
  const activeAddons = globalAddons.filter(a => 
    (config.addonIds || []).includes(a.id) && a.isActive
  );

  // State สำหรับตะกร้าลูกค้า
  const [selectedServing, setSelectedServing] = useState(activeServing[0]?.id || null);
  const [selectedSweetness, setSelectedSweetness] = useState("100%");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  // ฟังก์ชันติ๊กเลือก Add-on เข้าตะกร้า
  const toggleAddon = (id) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleAddToCart = () => {
    // 1. คำนวณราคา Base Price จากไอเทมโดยตรง
    const basePrice = item.price || 0;
    const servingData = activeServing.find(s => s.id === selectedServing);
    const servingPrice = servingData ? servingData.price : 0;
    
    // คำนวณราคาท็อปปิ้งรวม
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
    
    // 2. จัดรูปแบบข้อความรายละเอียดเพื่อโชว์ในบิล
    const servingLabel = servingData ? servingData.label.split(' ')[0] : "";
    const detailString = `${servingLabel} • หวาน ${selectedSweetness}`;
    const extrasString = addonDetails.length > 0 ? addonDetails.join(", ") : "ไม่มีเพิ่มเติม";

    // 3. ส่งข้อมูลลงตะกร้า
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

  // คำนวณราคาสุทธิแบบ Real-time เพื่อโชว์บนปุ่ม
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
      <div className="add-modal" style={{ maxWidth: '800px', backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', fontFamily: "'Prompt', sans-serif" }}>
        
        {/* Header ของเมนูชา */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
               {item.imgSrc ? <img src={item.imgSrc} alt={item.name} style={{width:'100%', height:'100%', borderRadius:'12px', objectFit:'cover'}} /> : '🍵'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#111827' }}>{item.name}</h2>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Tea Menu</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>Base Price: ฿{item.price}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body ตัวเลือก */}
        <div className="custom-scrollbar" style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          
          {/* SERVING TYPE */}
          {activeServing.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>1. รูปแบบเครื่องดื่ม / SERVING TYPE <span style={{color: '#059669'}}>*</span></h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {activeServing.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSelectedServing(s.id)}
                    style={{ 
                      padding: '10px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: s.id === selectedServing ? 700 : 500, cursor: 'pointer', transition: '0.2s',
                      background: s.id === selectedServing ? '#ecfdf5' : '#fff',
                      border: s.id === selectedServing ? '2px solid #10b981' : '1px solid #d1d5db',
                      color: s.id === selectedServing ? '#059669' : '#4b5563'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SWEETNESS LEVEL */}
          {activeSweetness.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', margin: 0, letterSpacing: '0.05em' }}>2. ระดับความหวาน / SWEETNESS LEVEL</h3>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>{selectedSweetness === '100%' ? 'หวานปกติ (100%)' : selectedSweetness}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {activeSweetness.map(s => (
                  <button 
                    key={s.label}
                    onClick={() => setSelectedSweetness(s.label)}
                    style={{ 
                      flex: 1, minWidth: '60px', padding: '12px 0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                      background: s.label === selectedSweetness ? '#10b981' : '#fff',
                      border: s.label === selectedSweetness ? '2px solid #10b981' : '1px solid #d1d5db',
                      color: s.label === selectedSweetness ? '#fff' : '#4b5563'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADD-ONS (กรองจากถังกลางมาแล้ว) */}
          {activeAddons.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>3. ท็อปปิ้งเพิ่มเติม / TOPPINGS & ADD-ONS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeAddons.map(ad => (
                  <div 
                    key={ad.id} 
                    onClick={() => toggleAddon(ad.id)}
                    style={{ 
                      padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s',
                      border: selectedAddons.includes(ad.id) ? '2px solid #10b981' : '1px solid #e5e7eb',
                      background: selectedAddons.includes(ad.id) ? '#ecfdf5' : '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedAddons.includes(ad.id)} 
                        readOnly 
                        style={{ accentColor: '#10b981', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer' }} 
                      />
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{ad.label}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{ad.desc}</div>
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

          {/* SPECIAL REQUESTS */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', letterSpacing: '0.05em' }}>4. โน้ตพิเศษ / SPECIAL REQUESTS</h3>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุข้อความเพิ่มเติมถึงบาริสต้า (เช่น แยกน้ำแข็ง, ไม่รับหลอด)..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'none', height: '80px', fontFamily: 'inherit' }}
            />
          </div>

        </div>

        {/* Footer สั่งซื้อ */}
        <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', background: '#fff', display: 'flex', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #d1d5db', borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', background: '#fff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
            <span style={{ width: '32px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', height: '40px', background: '#fff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" /></svg>
            </button>
          </div>

          <button 
            onClick={handleAddToCart}
            style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
          >
            <span>เพิ่มลงรายการสั่งซื้อ (Add to Order)</span>
            <span style={{ fontSize: '18px' }}>฿{currentTotalPrice}</span>
          </button>
        </div>

      </div>
    </div>
  );
}