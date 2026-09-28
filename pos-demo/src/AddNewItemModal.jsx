import React, { useRef, useState, useEffect } from "react";
import "./AddNewItemModal.css";

const CATEGORY_MAP = {
  coffee: "กาแฟ (Coffee)",
  tea: "ชา (Tea)",
  snack: "ขนม (Dessert)",
};

const PLACEHOLDER_MAP = {
  coffee: { th: "เช่น คาราเมล มัคคิอาโต้", en: "เช่น Caramel Macchiato" },
  tea: { th: "เช่น ชาไทย", en: "เช่น Thai Tea" },
  snack: { th: "เช่น คุกกี้", en: "เช่น Cookie" }
};

const MENU_CONFIG = {
  coffee: {
    serving: [
      { id: "hot", label: "ร้อน (Hot)" },
      { id: "iced", label: "เย็น (Iced) +฿10" },
      { id: "frappe", label: "ปั่น (Frappe) +฿15" },
    ]
  },
  tea: {
    serving: [
      { id: "hot", label: "ร้อน (Hot)" },
      { id: "iced", label: "เย็น (Iced)" },
      { id: "frappe", label: "ปั่น (Frappe) +฿15" },
    ]
  },
  snack: {
    serving: [] 
  }
};

// 👉 เพิ่ม props 'editingItem' เพื่อรองรับการกดแก้ไขจากปุ่มดินสอ
export function AddNewItemModal({ activeCategory = "coffee", onClose, onSave, editingItem }) {
  
  // 👉 ถ้าเป็นการแก้ไข ให้ดึงข้อมูลเก่ามาแสดง ถ้าไม่ใช่ก็ใช้ค่าเริ่มต้น
  const [selectedCategory, setSelectedCategory] = useState(editingItem ? editingItem.category : (activeCategory === 'all' ? 'coffee' : activeCategory));
  const [menuNameTh, setMenuNameTh] = useState(editingItem ? editingItem.name : '');
  const [menuPrice, setMenuPrice] = useState(editingItem ? editingItem.price : '');

  const currentConfig = MENU_CONFIG[selectedCategory] || MENU_CONFIG.coffee;
  const currentPlaceholder = PLACEHOLDER_MAP[selectedCategory] || PLACEHOLDER_MAP.coffee;

  const [serving, setServing] = useState({});
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initServing = {};
    currentConfig.serving.forEach(s => initServing[s.id] = true);
    setServing(initServing);
  }, [selectedCategory, currentConfig]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  const handleSubmit = () => {
    if (!menuNameTh || !menuPrice) {
      alert("กรุณากรอกชื่อเมนูและราคาให้ครบถ้วน");
      return;
    }

    if (onSave) {
      onSave({
        name: menuNameTh,
        price: menuPrice,
        category: selectedCategory,
        // 👉 ถ้าสร้างเมนูใหม่ สต็อกจะเป็น null (ไม่จำกัด) แต่ถ้าแก้ไขเมนูเดิม ให้คงค่าสต็อกเดิมเอาไว้
        stock: editingItem ? editingItem.stock : null
      });
    }
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal">
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </span>
            <div>
              {/* เปลี่ยนหัวข้ออัตโนมัติตามโหมดที่เปิดใช้งาน */}
              <h2 className="add-modal__title">{editingItem ? "แก้ไขเมนู (Edit Item)" : "เพิ่มเมนูใหม่ (Add New Item)"}</h2>
              <p className="add-modal__subtitle">
                บันทึกรายการสินค้าและปรับแต่งตัวเลือกเข้าสู่ระบบ POS
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="add-modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="add-modal__body">
          <div className="add-modal__row">
            <Field label="ชื่อเมนูภาษาไทย (Thai Name)" required>
              <input 
                type="text" 
                value={menuNameTh}
                onChange={(e) => setMenuNameTh(e.target.value)}
                placeholder={currentPlaceholder.th} 
                className="add-input" 
              />
            </Field>
            <Field label="ชื่อภาษาอังกฤษ (English Name)" required>
              <input 
                type="text" 
                placeholder={currentPlaceholder.en} 
                className="add-input" 
              />
            </Field>
          </div>

          <div className="add-modal__row">
            <Field label="หมวดหมู่ (Category)" required>
              <div className="add-select-wrapper">
                <select 
                  className="add-input add-select" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="coffee"> กาแฟ (Coffee)</option>
                  <option value="tea"> ชา (Tea)</option>
                  <option value="snack"> ขนม (Snacks)</option>
                </select>
                <svg className="add-select-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </Field>

            <Field label="ราคาขายปกติ (฿)" required>
              <div className="add-price-wrapper">
                <span className="add-price-symbol">฿</span>
                <input 
                  type="number" 
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                  placeholder="85" 
                  className="add-input add-input--price" 
                />
              </div>
            </Field>
          </div>

          {/* 👉 นำช่องกรอกสต็อกที่เคยอยู่ตรงนี้ออกไปแล้วครับ */}

          <div>
            <p className="add-section-title">อัปโหลดรูปภาพเมนู (Upload Box)</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="add-upload">
              <span className="add-upload__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </span>
              <span className="add-upload__text">
                <span className="add-upload__title">
                  {fileName ?? "คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง"}
                </span>
                <span className="add-upload__desc">PNG, JPG หรือ WEBP ขนาดสูงสุด 5MB</span>
              </span>
              <span className="add-upload__btn">เลือกไฟล์</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="add-file-hidden" onChange={handleFile} />
          </div>

          {currentConfig.serving.length > 0 && (
            <div>
              <p className="add-section-title">ตัวเลือกประเภทการเสิร์ฟ (Serving Options)</p>
              <div className="add-options">
                {currentConfig.serving.map((opt) => (
                  <InlineCheckbox
                    key={opt.id}
                    label={opt.label}
                    checked={!!serving[opt.id]}
                    onChange={(v) => setServing((s) => ({ ...s, [opt.id]: v }))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="add-modal__footer">
          <button type="button" onClick={onClose} className="add-btn add-btn--ghost">
            ยกเลิก
          </button>
          <button type="button" className="add-btn add-btn--solid" onClick={handleSubmit}>
             {/* เปลี่ยนข้อความปุ่มอัตโนมัติ */}
            {editingItem ? "บันทึกการแก้ไข" : "บันทึกเมนูใหม่"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="add-field">
      <span className="add-field__label">
        {label} {required && <span className="add-field__required" style={{ color: '#10b981' }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function InlineCheckbox({ label, checked, onChange }) {
  return (
    <label className="add-checkbox-label">
      <CheckBox checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function CheckBox({ checked, onChange }) {
  return (
    <span className="add-checkbox-wrapper">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="add-checkbox-input"
      />
      <svg className="add-checkbox-icon" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    </span>
  );
}