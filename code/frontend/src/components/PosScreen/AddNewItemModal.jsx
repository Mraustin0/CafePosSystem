import React, { useRef, useState, useEffect } from "react";
import "./AddNewItemModal.css";

// 1. แมปปิ้งชื่อหมวดหมู่
const CATEGORY_MAP = {
  coffee: "กาแฟ (Coffee)",
  tea: "ชา (Tea)",
  snack: "ขนม (Dessert)",
};

// 2. แมปปิ้ง Placeholder ให้เปลี่ยนตามหมวดหมู่
const PLACEHOLDER_MAP = {
  coffee: { th: "เช่น คาราเมล มัคคิอาโต้", en: "เช่น Caramel Macchiato" },
  tea: { th: "เช่น ชาไทย", en: "เช่น Thai Tea" },
  snack: { th: "เช่น คุกกี้", en: "เช่น Cookie" }
};

// 3. ฐานข้อมูลตัวเลือก
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

export function AddNewItemModal({ activeCategory = "coffee", onClose, onSubmit }) {
  // สร้าง State เก็บหมวดหมู่ เพื่อให้ตอนแก้ Dropdown แล้วค่าอื่นๆ หรือ Placeholder เปลี่ยนตามด้วย
  const [selectedCategory, setSelectedCategory] = useState(activeCategory === 'all' ? 'coffee' : activeCategory);

  const currentConfig = MENU_CONFIG[selectedCategory] || MENU_CONFIG.coffee;
  const currentPlaceholder = PLACEHOLDER_MAP[selectedCategory] || PLACEHOLDER_MAP.coffee;

  const [serving, setServing] = useState({});
  const [fileName, setFileName] = useState(null);
  const [thaiName, setThaiName] = useState("");
  const [engName, setEngName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  // รีเซ็ตตัวเลือก Serving ให้ติ๊กถูกทั้งหมดทุกครั้งที่เปลี่ยนหมวดหมู่
  useEffect(() => {
    const initServing = {};
    currentConfig.serving.forEach(s => initServing[s.id] = true);
    setServing(initServing);
  }, [selectedCategory, currentConfig]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  async function handleSave() {
    setSaveError(null);
    const priceNum = Number(price);
    if (!thaiName.trim()) { setSaveError("กรุณากรอกชื่อเมนูภาษาไทย"); return; }
    if (!price || Number.isNaN(priceNum) || priceNum < 0) { setSaveError("กรุณากรอกราคาที่ถูกต้อง"); return; }
    if (!onSubmit) { setSaveError("save handler not wired"); return; }
    setSaving(true);
    try {
      await onSubmit({ category: selectedCategory, name: thaiName.trim(), englishName: engName.trim(), price: priceNum });
      onClose();
    } catch (err) {
      setSaveError(err?.message ?? "บันทึกไม่สำเร็จ");
    } finally { setSaving(false); }
  }

  return (
    <div className="add-modal-overlay">
      <div className="add-modal">
        {/* Header */}
        <header className="add-modal__header">
          <div className="add-modal__header-left">
            <span className="add-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </span>
            <div>
              <h2 className="add-modal__title">เพิ่มเมนูใหม่ (Add New Item)</h2>
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

        {/* Body */}
        <div className="add-modal__body">
          {/* Row 1: names */}
          <div className="add-modal__row">
            <Field label="ชื่อเมนูภาษาไทย (Thai Name)" required>
              <input
                type="text"
                placeholder={currentPlaceholder.th}
                className="add-input"
                value={thaiName}
                onChange={(e) => setThaiName(e.target.value)}
              />
            </Field>
            <Field label="ชื่อภาษาอังกฤษ (English Name)" required>
              <input
                type="text"
                placeholder={currentPlaceholder.en}
                className="add-input"
                value={engName}
                onChange={(e) => setEngName(e.target.value)}
              />
            </Field>
          </div>

          {/* Row 2: category + price */}
          <div className="add-modal__row">
            
            {/* 👉 5. เปลี่ยนหมวดหมู่เป็น Select Dropdown ตามดีไซน์ */}
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
                <input type="number" placeholder="85" className="add-input add-input--price"
                       value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" />
              </div>
            </Field>
          </div>

          {/* Upload box */}
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

          {/* Serving options (แสดงเฉพาะตอนที่มีข้อมูลตามหมวดหมู่) */}
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

        {saveError && <p style={{ color: "#c0392b", padding: "0 24px" }}>{saveError}</p>}

        {/* Footer */}
        <footer className="add-modal__footer">
          <button type="button" onClick={onClose} className="add-btn add-btn--ghost" disabled={saving}>
            ยกเลิก
          </button>
          <button type="button" className="add-btn add-btn--solid" onClick={handleSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึกเมนูใหม่"}
          </button>
        </footer>
      </div>
    </div>
  );
}

// ---- Sub Components ----

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