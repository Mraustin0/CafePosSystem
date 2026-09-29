import React, { useState } from "react";

const FALLBACK_CONFIG = {
  serving: [
    { id: 'iced', label: 'เย็น (Iced)', price: 0, active: true },
    { id: 'hot', label: 'ร้อน (Hot)', price: 0, active: true },
    { id: 'frappe', label: 'ปั่น (Frappe +฿15)', price: 15, active: true }
  ],
  roasts: [],
  sweetness: [
    { label: '100%', active: true }, { label: '75%', active: true },
    { label: '50%', active: true }, { label: '25%', active: true }, { label: '0%', active: true }
  ],
  addonIds: ['boba', 'jelly', 'pudding']
};

export default function TeaModal({ item, onClose, onAddToCart, globalAddons = [] }) {
  const config = item.config || FALLBACK_CONFIG;

  const activeServing = config.serving?.filter(s => s.active) || [];
  const activeSweetness = config.sweetness?.filter(s => s.active) || [];

  const activeAddons = globalAddons.filter(a =>
    (config.addonIds || []).includes(a.id) && a.isActive
  );

  const [selectedServing, setSelectedServing] = useState(activeServing[0]?.id || null);
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
    const servingLabel = servingData ? servingData.label.split(' ')[0] : "";
    const detailString = `${servingLabel} • หวาน ${selectedSweetness}`;
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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>

      <style>{`
        .tea-modal {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          font-family: 'Prompt', sans-serif;
          overflow: hidden;
        }

        .tea-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #4b5563;
          margin: 0 0 12px 0;
          letter-spacing: 0.02em;
        }
        .req-star { color: #10b981; margin-left: 4px; }

        .opt-btn {
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 1;
        }
        .opt-btn.active {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
          box-shadow: 0 0 0 1px #10b981;
        }
        .opt-btn:hover:not(.active) { background: #f9fafb; }

        .card-btn {
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          display: flex;
          flex-direction: column;
        }
        .card-btn.active {
          background: #ecfdf5;
          border-color: #10b981;
          box-shadow: 0 0 0 1px #10b981;
        }
        .card-btn:hover:not(.active) { background: #f9fafb; }

        .checkbox-square {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          transition: 0.2s;
          flex-shrink: 0;
        }
        .addon-card.active .checkbox-square {
          background: #10b981;
          border-color: #10b981;
        }

        .note-input {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          height: 80px;
          outline: none;
          transition: 0.2s;
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        .note-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .stepper-container {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 4px;
          height: 52px;
        }
        .step-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #374151;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: 0.1s;
        }
        .step-btn:active { transform: scale(0.95); }
        .step-val {
          width: 40px;
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
      `}</style>

      <div className="tea-modal">

        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', overflow: 'hidden' }}>
               {item.imgSrc ? <img src={item.imgSrc} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : '🍵'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#111827' }}>{item.name}</h2>
                <span style={{ fontSize: '11px', background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '100px', fontWeight: 700 }}>Tea Menu</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#059669' }}>Base Price: ฿{item.price}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f3f4f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="tea-modal-body custom-scrollbar">

          {activeServing.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title">1. รูปแบบเครื่องดื่ม / SERVING TYPE <span className="req-star">*</span></h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {activeServing.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedServing(s.id)}
                    className={`opt-btn ${s.id === selectedServing ? 'active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSweetness.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>2. ระดับความหวาน / SWEETNESS LEVEL</h3>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                  {selectedSweetness === '100%' ? 'หวานปกติ (100%)' : selectedSweetness}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {activeSweetness.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSweetness(s.label)}
                    className={`opt-btn ${s.label === selectedSweetness ? 'active' : ''}`}
                    style={{ padding: '12px 0' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAddons.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title">3. ตัวเลือกเพิ่มเติม / ADD-ONS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeAddons.map(ad => {
                  const isSelected = selectedAddons.includes(ad.id);
                  return (
                    <div
                      key={ad.id}
                      onClick={() => toggleAddon(ad.id)}
                      className={`card-btn addon-card ${isSelected ? 'active' : ''}`}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="checkbox-square">
                          {isSelected && <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: isSelected ? '#047857' : '#111827', marginBottom: '2px' }}>{ad.label}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{ad.desc}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: ad.price === 0 ? '#10b981' : '#374151' }}>
                        {ad.price === 0 ? 'Free' : `+฿${ad.price}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="section-title">4. โน้ตพิเศษ / SPECIAL REQUESTS</h3>
            <textarea
              className="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุข้อความเพิ่มเติมถึงบาริสต้า (เช่น แยกน้ำแข็ง, ขอแก้วสองชั้น)..."
              autoComplete="off"
            />
          </div>

        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6', background: '#fff', display: 'flex', gap: '16px', alignItems: 'center' }}>

          <div className="stepper-container">
            <button className="step-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
            <span className="step-val">{quantity}</span>
            <button className="step-btn" onClick={() => setQuantity(quantity + 1)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" /></svg>
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              flex: 1,
              height: '52px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 24px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
          >
            <span>เพิ่มลงรายการสั่งซื้อ (Add to Order)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
