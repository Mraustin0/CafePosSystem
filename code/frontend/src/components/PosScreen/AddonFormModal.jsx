import React, { useEffect, useRef, useState } from "react";

/**
 * AddonFormModal
 * ฟอร์มสร้าง/แก้ไข Add-on (ท็อปปิ้งส่วนกลาง) ใช้ร่วมกันได้หลายหน้า
 *
 * props:
 *  - initial          Add-on เดิมเมื่อแก้ไข (ไม่ส่ง = สร้างใหม่)
 *  - defaultCategory  หมวดเริ่มต้นตอนสร้างใหม่: 'all' | 'coffee' | 'tea'
 *  - existingAddons   รายการทั้งหมด ใช้ตรวจชื่อซ้ำในหมวดเดียวกัน
 *  - onSave(addon)    ส่ง { id, label, desc, price, isActive, category }
 *  - onClose()
 */
export default function AddonFormModal({
  initial = null,
  defaultCategory = "all",
  existingAddons = [],
  onSave,
  onClose,
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.label ?? "");
  const [desc, setDesc] = useState(
    initial && initial.desc !== `+${initial.label}` ? initial.desc : ""
  );
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [category, setCategory] = useState(initial?.category ?? defaultCategory);
  const [error, setError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = () => {
    const label = name.trim();
    const priceNum = price === "" ? 0 : Number(price);

    if (!label) return setError("กรุณากรอกชื่อ Add-on");
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return setError("ราคาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");

    const duplicated = existingAddons.some(
      (a) =>
        a.id !== initial?.id &&
        a.category === category &&
        a.label.trim().toLowerCase() === label.toLowerCase()
    );
    if (duplicated) return setError("มี Add-on ชื่อนี้ในหมวดเดียวกันแล้ว");

    onSave?.({
      ...(initial || {}),
      id: initial?.id ?? "addon_" + Date.now(),
      label,
      desc: desc.trim() || `+${label}`,
      price: Math.round(priceNum),
      isActive: initial?.isActive ?? true,
      category,
    });
  };

  return (
    <div className="af-backdrop" onClick={onClose}>
      <style>{`
        @keyframes afFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .af-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center; z-index: 1500; padding: 24px;
          font-family: 'Prompt', "Noto Sans Thai", sans-serif;
        }
        .af-card {
          width: 100%; max-width: 460px; background: #fff; border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
          animation: afFadeIn 0.2s ease-out forwards; overflow: hidden;
        }
        .af-head { padding: 22px 24px 8px; }
        .af-title { font-size: 18px; font-weight: 800; color: #111827; margin: 0 0 4px; }
        .af-sub { font-size: 13px; color: #6b7280; margin: 0; }
        .af-body { padding: 16px 24px 8px; display: flex; flex-direction: column; gap: 16px; }
        .af-label { display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
        .af-req { color: #ef4444; }
        .af-input {
          width: 100%; padding: 11px 14px; border-radius: 10px; border: 1px solid #d1d5db;
          font-size: 14px; outline: none; background: #fff !important; color: #111827 !important;
          box-sizing: border-box; font-family: inherit;
        }
        .af-input:focus { border-color: #00694b; box-shadow: 0 0 0 2px rgba(0,105,75,0.2); }
        .af-row { display: flex; gap: 12px; }
        .af-row > div { flex: 1; }
        .af-note {
          font-size: 12px; color: #6b7280; background: #f9fafb; border: 1px solid #f3f4f6;
          border-radius: 10px; padding: 10px 12px; line-height: 1.5;
        }
        .af-error { font-size: 13px; color: #dc2626; font-weight: 600; margin: 0; }
        .af-foot { padding: 16px 24px 22px; display: flex; justify-content: flex-end; gap: 10px; }
        .af-btn { padding: 11px 22px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .af-btn--ghost { border: 1px solid #d1d5db; background: #fff; color: #4b5563; }
        .af-btn--ghost:hover { background: #f9fafb; }
        .af-btn--solid { border: none; background: #00694b; color: #fff; box-shadow: 0 4px 6px -1px rgba(0,105,75,0.2); }
        .af-btn--solid:hover { background: #005a40; }
      `}</style>

      <div className="af-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="af-head">
          <h3 className="af-title">{isEdit ? "แก้ไข Add-on" : "เพิ่ม Add-on ใหม่"}</h3>
          <p className="af-sub">กำหนดชื่อและราคาเสริมของตัวเลือกเพิ่มเติม</p>
        </div>

        <div className="af-body">
          <div>
            <label className="af-label">ชื่อ Add-on <span className="af-req">*</span></label>
            <input
              ref={nameRef}
              className="af-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="เช่น นมโอ๊ต"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="af-label">คำอธิบายย่อ</label>
            <input
              className="af-input"
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="เช่น +Oat Milk (เว้นว่างได้)"
              autoComplete="off"
            />
          </div>

          <div className="af-row">
            <div>
              <label className="af-label">ราคาเพิ่ม (฿)</label>
              <input
                className="af-input"
                type="number"
                min="0"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setError(""); }}
                placeholder="0 = ฟรี"
              />
            </div>
            <div>
              <label className="af-label">ใช้ได้กับหมวด</label>
              <select
                className="af-input"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setError(""); }}
              >
                <option value="all">ทั้งหมด</option>
                <option value="coffee">กาแฟ (Coffee)</option>
                <option value="tea">ชา (Tea)</option>
              </select>
            </div>
          </div>

          <div className="af-note">
            Add-on นี้เป็นรายการส่วนกลาง จะปรากฏในหน้าจัดการท็อปปิ้ง และเลือกใช้กับเมนูอื่นในหมวดเดียวกันได้
          </div>

          {error && <p className="af-error">{error}</p>}
        </div>

        <div className="af-foot">
          <button type="button" className="af-btn af-btn--ghost" onClick={onClose}>ยกเลิก</button>
          <button type="button" className="af-btn af-btn--solid" onClick={handleSubmit}>
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม Add-on"}
          </button>
        </div>
      </div>
    </div>
  );
}