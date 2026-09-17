import React, { useState } from "react";
import "./TeaModal.css";

const SERVING_TYPES = [
  { id: "iced", label: "เย็น (Iced)", priceDelta: 0 },
  { id: "hot", label: "ร้อน (Hot)", priceDelta: 0 },
  { id: "frappe", label: "ปั่น (Frappe +฿15)", priceDelta: 15 },
];

const SWEETNESS_LEVELS = [
  { id: "100", label: "100%", desc: "หวานปกติ (100%)" },
  { id: "75", label: "75%", desc: "หวาน 75% (หวานกำลังดี)" },
  { id: "50", label: "50%", desc: "หวาน 50% (หวานน้อย)" },
  { id: "25", label: "25%", desc: "หวาน 25% (หวานน้อยมาก)" },
  { id: "0", label: "0%", desc: "ไม่หวานเลย (0%)" },
];

const TOPPINGS = [
  { id: "honey_konjac", title: "บุกน้ำผึ้ง (+Honey Konjac Jelly)", subtitle: "เพิ่มเนื้อสัมผัสหนึบและกลิ่นหอมน้ำผึ้งธรรมชาติ", priceDelta: 15 },
  { id: "whipped_cream", title: "วิปครีม (+Whipped Cream)", subtitle: "ครีมสดตีฟูเพื่อความละมุน", priceDelta: 15 },
  { id: "milk_pudding", title: "พุดดิ้งนมสด (+Fresh Milk Pudding)", subtitle: "เนื้อพุดดิ้งเนียนนุ่ม กลิ่นนมสดแท้", priceDelta: 20 },
  { id: "grass_jelly", title: "เฉาก๊วย (+Grass Jelly)", subtitle: "เฉาก๊วยแท้เนื้อสัมผัสเหนียวนุ่ม", priceDelta: 15 },
  { id: "aloe_vera", title: "ว่านหางจระเข้ (+Aloe Vera)", subtitle: "ว่านหางจระเข้ในน้ำเชื่อมเพื่อความสดชื่น", priceDelta: 15 },
  { id: "brown_sugar_boba", title: "ไข่มุกบราวน์ชูการ์ (+Brown Sugar Boba)", subtitle: "ไข่มุกต้มสุกผสานน้ำตาลทรายแดง", priceDelta: 15 },
  { id: "sago", title: "สาคู (+Sago)", subtitle: "เม็ดสาคูต้มสุกเนื้อนุ่มลื่น", priceDelta: 10 },
  { id: "chia_seeds", title: "เมล็ดเจีย (+Chia Seeds)", subtitle: "เมล็ดเจียออร์แกนิกอุดมด้วยคุณค่าทางโภชนาการ", priceDelta: 15 },
];

const QUICK_NOTES = ["+ แยกน้ำแข็ง", "+ หวานน้อยมาก", "+ นมโอ๊ต (+Oat Milk)"];

export default function TeaModal({ item, onClose, onAddToCart }) {
  const [serving, setServing] = useState("iced");
  const [sweetness, setSweetness] = useState("75");
  const [selectedToppings, setSelectedToppings] = useState([]);
  
  // แยกระบบโน้ตเป็น 2 ส่วน: ข้อความที่พิมพ์เอง กับ แท็กที่กดเลือก
  const [customRequest, setCustomRequest] = useState("");
  const [activeChips, setActiveChips] = useState([]);
  
  const [quantity, setQuantity] = useState(1);

  if (!item) return null; 

  const basePrice = item.price || 65;

  const getSweetnessLabel = (val) => {
    return SWEETNESS_LEVELS.find((s) => s.id === val)?.desc || `${val}%`;
  };

  const toggleTopping = (id) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // ฟังก์ชันกดยืด-หด Auto message
  const toggleChip = (chip) => {
    setActiveChips((prev) => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && customRequest.trim() !== '') {
      e.preventDefault(); 
      const newTag = customRequest.trim();
      if (!activeChips.includes(newTag)) {
        setActiveChips([...activeChips, newTag]);
      }
      setCustomRequest(""); 
    }
  };

  const servingDelta = SERVING_TYPES.find((s) => s.id === serving)?.priceDelta || 0;
  const addOnDelta = TOPPINGS
    .filter((a) => selectedToppings.includes(a.id))
    .reduce((sum, a) => sum + a.priceDelta, 0);
  const totalPrice = (basePrice + servingDelta + addOnDelta) * quantity;

  const handleConfirm = () => {
    // นำแท็กที่เลือก + ข้อความที่พิมพ์ มารวมกัน
    const finalNote = [
      ...activeChips.map(chip => chip.replace(/^\+\s*/, "")), 
      customRequest
    ].filter(Boolean).join(", ");

    onAddToCart({
      ...item,
      qty: quantity,
      price: totalPrice / quantity,
      detail: `${SERVING_TYPES.find(s=>s.id===serving).label} • ${getSweetnessLabel(sweetness)}`,
      extras: selectedToppings.map(id => TOPPINGS.find(a=>a.id===id).title).join(", "),
      note: finalNote ? `โน้ต: ${finalNote}` : "",
      isNew: true
    });
    onClose();
  };

  return (
    <div className="tea-modal-overlay">
      <div className="tea-modal">
        {/* Header */}
        <header className="tea-header">
          <div className="tea-header-left">
            <div className="tea-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8v8a6 6 0 0 0 12 0V8"/><path d="M4 8h16"/><path d="M8 8 9 3h6l1 5"/><circle cx="10" cy="15" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="12" cy="17" r="1"/>
              </svg>
            </div>
            <div>
              <div className="tea-title-row">
                <h2 className="tea-title">{item.name || "ชาไทยพรีเมียม / Artisan Thai Tea"}</h2>
                <span className="tea-badge">Artisan Tea</span>
              </div>
              <p className="tea-base-price">Base Price: ฿{basePrice.toFixed(2)}</p>
            </div>
          </div>
          <button className="tea-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {/* Body */}
        <div className="tea-body">
          <section>
            <h3 className="tea-section-title">1. รูปแบบเครื่องดื่ม / SERVING TYPE <span className="tea-req">*</span></h3>
            <div className="tea-pill-row">
              {SERVING_TYPES.map((opt) => (
                <button key={opt.id} className={`tea-pill ${serving === opt.id ? "active" : ""}`} onClick={() => setServing(opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="tea-section-head">
              <h3 className="tea-section-title">2. ระดับความหวาน / SWEETNESS LEVEL</h3>
              <span className="tea-head-note">{getSweetnessLabel(sweetness)}</span>
            </div>
            <div className="tea-pill-row">
              {SWEETNESS_LEVELS.map((opt) => (
                <button key={opt.id} className={`tea-sweet-pill ${sweetness === opt.id ? "active" : ""}`} onClick={() => setSweetness(opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="tea-section-title">3. ท็อปปิ้งชา & ตัวเลือกเสริม / TEA TOPPINGS & ADD-ONS</h3>
            <div className="tea-addon-list">
              {TOPPINGS.map((opt) => {
                const isChecked = selectedToppings.includes(opt.id);
                const isFree = opt.priceDelta === 0;
                return (
                  <div key={opt.id} className={`tea-addon ${isChecked ? "checked" : ""}`} onClick={() => toggleTopping(opt.id)}>
                    <span className="tea-checkbox">
                      {isChecked && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </span>
                    <div className="tea-addon-info">
                      <span className="tea-addon-title">{opt.title}</span>
                      <span className="tea-addon-sub">{opt.subtitle}</span>
                    </div>
                    <span className={`tea-addon-price ${isFree ? "free" : ""}`}>
                      {isFree ? "Free" : `+฿${opt.priceDelta}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Special Requests */}
          <section>
            <h3 className="tea-section-title">4. โน้ตพิเศษ / SPECIAL REQUESTS</h3>
            
            {/* กล่องข้อความแบบมี Tag ดันเข้าไปอยู่ข้างใน */}
            <div className="tea-input-container" onClick={() => document.getElementById('tea-note-input').focus()}>
              {activeChips.map((chip, idx) => (
                <span key={idx} className="tea-inner-tag">
                  {chip}
                  <span className="tea-inner-tag-close" onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleChip(chip); 
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </span>
                </span>
              ))}
              <input 
                id="tea-note-input"
                type="text" 
                className="tea-inner-input" 
                placeholder={activeChips.length === 0 ? "พิมพ์โน้ตอื่นๆ แล้วกด Enter..." : "พิมพ์เพิ่มแล้วกด Enter..."} 
                value={customRequest} 
                onChange={(e) => setCustomRequest(e.target.value)} 
                onKeyDown={handleKeyDown} 
              />
            </div>

            {/* ปุ่มช้อยส์ด้านล่าง */}
            <div className="tea-chip-row">
              {QUICK_NOTES.map((chip, idx) => {
                const isActive = activeChips.includes(chip);
                return (
                  <button key={idx} className={`tea-chip ${isActive ? "is-active" : ""}`} onClick={() => toggleChip(chip)}>
                    {chip}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="tea-footer">
          <div className="tea-qty">
            <button className="tea-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
            </button>
            <span className="tea-qty-value">{quantity}</span>
            <button className="tea-qty-btn" onClick={() => setQuantity(quantity + 1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <button className="tea-add-btn" onClick={handleConfirm}>
            <span>เพิ่มลงรายการสั่งซื้อ (Add to Order)</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}