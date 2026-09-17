import React, { useState } from "react";
import "./CoffeeModal.css";

const servingTypes = [
  { id: "iced", label: "เย็น (Iced)", priceDelta: 0 },
  { id: "hot", label: "ร้อน (Hot)", priceDelta: 0 },
  { id: "frappe", label: "ปั่น (Frappe +฿15)", priceDelta: 15 },
];

const roastProfiles = [
  { id: "medium", title: "คั่วกลาง (Medium Roast)", subtitle: "Nutty, Caramel, Balanced acidity" },
  { id: "dark", title: "คั่วเข้ม (Dark Roast)", subtitle: "Bold, Smokey, Dark Chocolate" },
];

const sweetnessLevels = [
  { id: "100", label: "100%" }, { id: "75", label: "75%" },
  { id: "50", label: "50%" }, { id: "25", label: "25%" }, { id: "0", label: "0%" },
];

const addOnsList = [
  { id: "extra-shot", title: "เพิ่มช็อตกาแฟ (+Extra Espresso Shot)", subtitle: "เพิ่มปริมาณเอสเพรสโซช็อต", priceDelta: 20 },
  { id: "whipped-cream", title: "วิปครีม (+Whipped Cream)", subtitle: "วิปปิ้งครีมแท้", priceDelta: 15 },
  { id: "konjac-jelly", title: "บุกน้ำผึ้ง (+Honey Konjac Jelly)", subtitle: "บุกกลิ่นน้ำผึ้ง", priceDelta: 20 },
  { id: "half-shot", title: "ลดช็อตกาแฟ (Half Shot)", subtitle: "ลดปริมาณคาเฟอีน", priceDelta: 0 },
];

const specialRequestChips = ["+ แยกน้ำแข็ง", "+ หวานน้อยมาก", "+ ไม่ใส่ฟองนม"];

export default function CoffeeModal({ item, onClose, onAddToCart }) {
  const [serving, setServing] = useState("iced");
  const [roast, setRoast] = useState("medium");
  const [sweetness, setSweetness] = useState("100");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  
  // แยกระบบโน้ตเป็น 2 ส่วน: ข้อความที่พิมพ์เอง กับ แท็กที่กดเลือก
  const [customRequest, setCustomRequest] = useState("");
  const [activeChips, setActiveChips] = useState([]);
  
  const [quantity, setQuantity] = useState(1);

  if (!item) return null; 

  const basePrice = item.price || 55;

  // แปลงตัวเลขความหวานเป็นข้อความ
  const getSweetnessLabel = (val) => {
    switch (val) {
      case "100": return "หวานปกติ (100%)";
      case "75": return "หวานน้อย (75%)";
      case "50": return "หวานน้อยมาก (50%)";
      case "25": return "หวานนิดเดียว (25%)";
      case "0": return "ไม่หวานเลย (0%)";
      default: return `${val}%`;
    }
  };

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // ฟังก์ชันกดยืด-หด Auto message (กดแล้วเป็น Active ถ้ากดอีกทีคือลบออก)
  const toggleChip = (chip) => {
    setActiveChips((prev) => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && customRequest.trim() !== '') {
      e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรช
      const newTag = customRequest.trim();
      // เช็คว่าไม่ให้ใส่แท็กซ้ำ
      if (!activeChips.includes(newTag)) {
        setActiveChips([...activeChips, newTag]);
      }
      setCustomRequest(""); // ล้างกล่องข้อความให้ว่างเพื่อรอพิมพ์คำต่อไป
    }
  };

  const servingDelta = servingTypes.find((s) => s.id === serving)?.priceDelta || 0;
  const addOnDelta = addOnsList
    .filter((a) => selectedAddOns.includes(a.id))
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
      detail: `${servingTypes.find(s=>s.id===serving).label} • คั่ว${roast} • หวาน ${sweetness}%`,
      extras: selectedAddOns.map(id => addOnsList.find(a=>a.id===id).title).join(", "),
      note: finalNote ? `โน้ต: ${finalNote}` : "",
      isNew: true
    });
    onClose();
  };

  return (
    <div className="coffee-modal-overlay">
      <div className="coffee-modal">
        {/* Header */}
        <header className="coffee-header">
          <div className="coffee-header-left">
            <div className="coffee-icon-box">☕️</div>
            <div>
              <div className="coffee-title-row">
                <h2 className="coffee-title">{item.name}</h2>
                <span className="coffee-badge">Espresso Bar</span>
              </div>
              <p className="coffee-base-price">Base Price: ฿{basePrice}</p>
            </div>
          </div>
          <button className="coffee-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {/* Body */}
        <div className="coffee-body">
          <section>
            <h3 className="coffee-section-title">1. รูปแบบเครื่องดื่ม / SERVING TYPE <span className="coffee-req">*</span></h3>
            <div className="coffee-pill-row">
              {servingTypes.map((opt) => (
                <button key={opt.id} className={`coffee-pill ${serving === opt.id ? "active" : ""}`} onClick={() => setServing(opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="coffee-section-title">2. เมล็ดกาแฟ / ROAST PROFILE</h3>
            <div className="coffee-roast-grid">
              {roastProfiles.map((opt) => (
                <div key={opt.id} className={`coffee-roast-card ${roast === opt.id ? "active" : ""}`} onClick={() => setRoast(opt.id)}>
                  <span className="coffee-radio"><span className="coffee-radio-dot"></span></span>
                  <div>
                    <span className="coffee-roast-title">{opt.title}</span>
                    <span className="coffee-roast-sub">{opt.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="coffee-section-head">
              <h3 className="coffee-section-title">3. ระดับความหวาน / SWEETNESS LEVEL</h3>
              {/* เปลี่ยนให้โชว์ข้อความเต็มๆ แทน */}
              <span className="coffee-head-note">{getSweetnessLabel(sweetness)}</span>
            </div>
            <div className="coffee-pill-row">
              {sweetnessLevels.map((opt) => (
                <button key={opt.id} className={`coffee-sweet-pill ${sweetness === opt.id ? "active" : ""}`} onClick={() => setSweetness(opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="coffee-section-title">4. ตัวเลือกเพิ่มเติม / ADD-ONS</h3>
            <div className="coffee-addon-list">
              {addOnsList.map((opt) => {
                const isChecked = selectedAddOns.includes(opt.id);
                const isFree = opt.priceDelta === 0;
                return (
                  <div key={opt.id} className={`coffee-addon ${isChecked ? "checked" : ""}`} onClick={() => toggleAddOn(opt.id)}>
                    <span className="coffee-checkbox">
                      {isChecked && (
                        /* SVG Checkmark สีเข้ม ตัดกับพื้นหลังสีส้ม */
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </span>
                    <div className="coffee-addon-info">
                      <span className="coffee-addon-title">{opt.title}</span>
                      <span className="coffee-addon-sub">{opt.subtitle}</span>
                    </div>
                    <span className={`coffee-addon-price ${isFree ? "free" : ""}`}>
                      {isFree ? "Free" : `+฿${opt.priceDelta}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. Special Requests */}
          <section>
            <h3 className="coffee-section-title">5. โน้ตพิเศษ / SPECIAL REQUESTS</h3>
            
            {/* กล่องข้อความแบบมี Tag ดันเข้าไปอยู่ข้างใน */}
            <div className="coffee-input-container" onClick={() => document.getElementById('note-input').focus()}>
              {activeChips.map((chip, idx) => (
                <span key={idx} className="coffee-inner-tag">
                  {chip}
                  <span className="coffee-inner-tag-close" onClick={(e) => { 
                    e.stopPropagation(); /* ป้องกันไม่ให้ทะลุไปโฟกัส input */
                    toggleChip(chip); 
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </span>
                </span>
              ))}
              <input 
                id="note-input"
                type="text" 
                className="coffee-inner-input" 
                placeholder={activeChips.length === 0 ? "พิมพ์โน้ตอื่นๆ... " : "พิมพ์เพิ่มแล้วกด Enter..."} 
                value={customRequest} 
                onChange={(e) => setCustomRequest(e.target.value)} 
                onKeyDown={handleKeyDown} 
              />
            </div>

            {/* ปุ่มช้อยส์ด้านล่าง */}
            <div className="coffee-chip-row">
              {specialRequestChips.map((chip, idx) => {
                const isActive = activeChips.includes(chip);
                return (
                  <button key={idx} className={`coffee-chip ${isActive ? "is-active" : ""}`} onClick={() => toggleChip(chip)}>
                    {chip}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="coffee-footer">
          <div className="coffee-qty">
            {/* ใส่ SVG เครื่องหมายลบ */}
            <button className="coffee-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
            </button>
            <span className="coffee-qty-value">{quantity}</span>
            {/* ใส่ SVG เครื่องหมายบวก */}
            <button className="coffee-qty-btn" onClick={() => setQuantity(quantity + 1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <button className="coffee-add-btn" onClick={handleConfirm}>
            <span>เพิ่มลงรายการสั่งซื้อ (Add to Order)</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}