import React, { useState, useEffect } from "react";

export default function PaymentModal({ onClose, cart = [], onConfirmPayment, orderId = "A-108" }) {
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemCount = cart.length;
  const quantityCount = cart.reduce((sum, item) => sum + item.qty, 0);
  
  const [activeMethod, setActiveMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState(totalAmount);

  useEffect(() => {
    setCashGiven(totalAmount);
  }, [totalAmount]);

  const changeAmount = Math.max(0, cashGiven - totalAmount);

  const handleConfirm = () => {
    if (onConfirmPayment) {
      onConfirmPayment({ method: activeMethod, totalAmount, cashGiven, changeAmount });
    }
  };

  const cashOptions = [
    { val: totalAmount, label: "พอดี" },
    { val: 55, label: "" },
    { val: Math.ceil(totalAmount / 100) * 100, label: `ทอน ฿${((Math.ceil(totalAmount / 100) * 100) - totalAmount).toFixed(2)}` },
    { val: 500, label: `ทอน ฿${(500 - totalAmount).toFixed(2)}` },
    { val: 1000, label: `ทอน ฿${(1000 - totalAmount).toFixed(2)}` },
  ];

  const uniqueCashOptions = Array.from(new Map(cashOptions.map(item => [item.val, item])).values());

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', zIndex: 1200 }}>
      
      <style>{`
        .payment-fullscreen {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Prompt', sans-serif;
          background: #f4f6fb;
        }

        /* 👉 Header ด้านบนของหน้า Fullscreen */
        .fs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .fs-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* 👉 ฝั่งซ้าย (ทวนออเดอร์) */
        .split-left {
          width: 40%;
          background: #f4f6fb;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }
        
        .order-header {
          padding: 24px 32px;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 32px;
        }

        .order-row {
          padding: 24px 0;
          border-bottom: 1px dashed #d1d5db;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .qty-badge {
          width: 28px;
          height: 28px;
          background: #e6f7f1;
          color: #00694b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          margin-top: 2px;
        }

        .order-summary-footer {
          padding: 24px 32px;
          border-top: 1px solid #e5e7eb;
        }

        .total-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }

        /* 👉 ฝั่งขวา (เลือกชำระเงิน) */
        .split-right {
          width: 60%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          padding: 40px 60px; /* เพิ่ม Padding ให้ดูโปร่งขึ้น */
          overflow-y: auto;
        }

        .method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .method-btn {
          height: 120px;
          border-radius: 12px;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: 0.2s;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }
        .method-btn.cash {
          background: #9cf5c8;
          border-color: #004f37;
        }
        .method-btn.promptpay {
          background: #f0f3ff;
          border-color: transparent;
        }
        .method-btn.promptpay:hover { background: #e7eeff; }

        .tender-box {
          background: #e7eeff;
          border-radius: 16px;
          padding: 32px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cash-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .cash-btn {
          background: #ffffff;
          border-radius: 12px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          cursor: pointer;
          transition: 0.2s;
        }
        .cash-btn:hover:not(.active) { border-color: #d1d5db; }
        .cash-btn.active {
          background: #004f37;
          color: #ffffff;
          border-color: #004f37;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .btn-cancel {
          width: 30%;
          background: #f0f3ff;
          color: #111827;
          border: none;
          border-radius: 12px;
          height: 64px;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .btn-confirm {
          width: 70%;
          background: #004f37;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          height: 64px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="payment-fullscreen">
        
        {/* --- Header (Full Screen) --- */}
        

        {/* --- Body (Split Screen) --- */}
        <div className="fs-body">
          
          {/* --- ฝั่งซ้าย: ทวนออเดอร์ --- */}
          <div className="split-left">
            <div className="order-header">
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>รายการออร์เดอร์</h2>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Order #{orderId} • {itemCount} รายการ</div>
            </div>

            <div className="order-list custom-scrollbar">
              {cart.map((item, index) => (
                <div key={item.id || index} className="order-row">
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="qty-badge">{item.qty}x</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.detail}</div>
                      {item.extras && item.extras !== "ไม่มีเพิ่มเติม" && <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.extras}</div>}
                      {item.note && <div style={{ fontSize: '13px', color: '#00694b', fontWeight: 600, marginTop: '4px' }}>* {item.note}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                    ฿{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#4b5563', marginBottom: '12px' }}>
                <span>ยอดรวมย่อย (Subtotal)</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>฿{totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#00694b', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  ส่วนลดพิเศษ (Promotion)
                </span>
                <span>-฿0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' }}>
                <span>ภาษีมูลค่าเพิ่ม VAT 7% (รวมในราคาแล้ว)</span>
                <span>฿{(totalAmount * 7 / 107).toFixed(2)}</span>
              </div>

              <div className="total-card">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>ยอดชำระสุทธิ (TOTAL DUE)</div>
                  <div style={{ fontSize: '42px', fontWeight: 800, color: '#004f37' }}>฿{totalAmount.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#9cf5c8', color: '#00694b', fontSize: '14px', fontWeight: 700, padding: '6px 16px', borderRadius: '100px', marginBottom: '8px' }}>รอชำระเงิน</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{itemCount} items</div>
                </div>
              </div>
            </div>
          </div>


          {/* --- ฝั่งขวา: เลือกวิธีชำระเงิน --- */}
          <div className="split-right custom-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111827' }}>เลือกวิธีชำระเงิน</h2>
            </div>

            <div className="method-grid">
              <div className={`method-btn ${activeMethod === 'cash' ? 'cash' : 'promptpay'}`} onClick={() => setActiveMethod('cash')}>
                <div style={{ width: '48px', height: '48px', background: '#004f37', color: '#ffffff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span style={{ fontSize: '18px' }}>เงินสด</span>
              </div>
              
              <div className={`method-btn ${activeMethod === 'promptpay' ? 'cash' : 'promptpay'}`} onClick={() => setActiveMethod('promptpay')} style={{ background: activeMethod === 'promptpay' ? '#9cf5c8' : '#f0f3ff', borderColor: activeMethod === 'promptpay' ? '#004f37' : 'transparent' }}>
                <div style={{ width: '48px', height: '48px', background: activeMethod === 'promptpay' ? '#004f37' : '#ffffff', color: activeMethod === 'promptpay' ? '#ffffff' : '#004f37', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <span style={{ fontSize: '18px' }}>พร้อมเพย์</span>
              </div>
            </div>

            <div style={{ margin: '32px 0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#111827' }}>
                {activeMethod === 'cash' ? 'บันทึกรับเงินสด' : 'สแกน QR พร้อมเพย์'}
              </h3>
            </div>

            <div className="tender-box">
              {activeMethod === 'cash' ? (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#004f37' }}>ยอดรับ: ฿{totalAmount.toFixed(2)}</div>
                  
                  <div className="cash-grid">
                    {uniqueCashOptions.map((cash, i) => (
                      <div 
                        key={i} 
                        className={`cash-btn ${cashGiven === cash.val ? 'active' : ''}`}
                        onClick={() => setCashGiven(cash.val)}
                      >
                        <span style={{ fontSize: '20px', fontWeight: 700 }}>฿{cash.val}</span>
                        {cash.label && (
                          <span style={{ fontSize: '13px', color: cashGiven === cash.val ? '#9cf5c8' : '#6b7280', marginTop: '4px' }}>
                            {cash.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '180px', height: '180px', background: '#ffffff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <svg width="100" height="100" fill="none" stroke="#111827" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <div style={{ fontSize: '16px', color: '#4b5563' }}>รอการสแกนและยืนยันจากธนาคาร...</div>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button className="btn-cancel" onClick={onClose}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                ยกเลิก
              </button>
              <button className="btn-confirm" onClick={handleConfirm}>
                
                ยืนยันการชำระเงิน
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}