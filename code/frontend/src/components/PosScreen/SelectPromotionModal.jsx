import React, { useState } from 'react';
import './AddNewItemModal.css';

export function SelectPromotionModal({ onClose, onSelectPromotion }) {
  const [selectedPromoId, setSelectedPromoId] = useState(null);
  const [manualCode, setManualCode] = useState('');

  const promotions = [
    {
      id: 'p1',
      title: 'ส่วนลดสมาชิก (Member Special)',
      subtitle: 'ยอดขั้นต่ำ ฿200 • สมาชิกสะสมแต้ม',
      value: '-10%',
      code: 'MEMBER10', 
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      id: 'p2',
      title: 'คูปองลดบิลใหญ่ (Big Bill Voucher)',
      subtitle: 'ยอดบิลขั้นต่ำ ฿500 ขึ้นไป',
      value: '-฿50',
      code: 'SAVE50',
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    },
    {
      id: 'p3',
      title: 'ซื้อ 1 แถม 1 ชาหรือกาแฟ (Buy 1 Get 1)',
      subtitle: 'เฉพาะเครื่องดื่มหมวดชา & กาแฟ ไซส์ L',
      value: 'ฟรี 1 แก้ว',
      code: 'B1G1',
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      )
    },
    {
      id: 'p4',
      title: 'ต้อนรับลูกค้าใหม่ (First Order)',
      subtitle: 'ไม่มีขั้นต่ำ (เฉพาะบิลเปิดโต๊ะแรก)',
      value: '-20%',
      code: 'WELCOME20',
      iconBg: '#f3f4f6',
      iconColor: '#10b981',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    }
  ];

  const handleApplyPromo = (promo) => {
    setSelectedPromoId(promo.id);
    if (onSelectPromotion) {
      onSelectPromotion(promo);
    }
  };

  return (
    <div className="add-modal-overlay" style={{ zIndex: 1100 }}>
      <div className="add-modal" style={{ maxWidth: '520px', padding: '0', paddingBottom: '16px' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 24px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                 <line x1="7" y1="7" x2="7.01" y2="7" />
               </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>เลือกโปรโมชั่น (Select Promotion)</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>เลือกหรือกรอกรหัสส่วนลดเพื่อใช้กับออเดอร์นี้</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Section: กรอกโค้ดแบบ Manual */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '8px' }}>
              กรอกรหัสส่วนลด (Enter Promo Code)
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
              </div>
              <input 
                type="text" 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="เช่น MEMBER10, SAVE50" 
                style={{ width: '100%', padding: '12px 16px 12px 38px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#ffffff', fontSize: '14px', outline: 'none', color: '#111827' }}
              />
            </div>
          </div>

          {/* Section: List of Promotions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563' }}>โปรโมชั่นที่ใช้ได้ (Available Promotions)</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>4 Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {promotions.map(promo => {
                const isSelected = selectedPromoId === promo.id;
                
                return (
                  <div 
                    key={promo.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                      background: isSelected ? '#f0fdf4' : '#fff',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleApplyPromo(promo)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: promo.iconBg, color: promo.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '18px', height: '18px' }}>{promo.icon}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{promo.title}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{promo.subtitle}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {isSelected ? (
                        <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          เลือกแล้ว
                        </button>
                      ) : (
                        <button style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                          เลือก (Select)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}