import React, { useState, useEffect } from "react";

export default function PaymentModal({ onClose, cart = [], onConfirmPayment, orderId = "A-108" }) {
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemCount = cart.length;
  // const quantityCount = cart.reduce((sum, item) => sum + item.qty, 0); 

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

  const nextHundred = Math.ceil(totalAmount / 100) * 100;
  const cashOptions = [
    { val: totalAmount, label: "พอดี" },
    ...(nextHundred > totalAmount ? [{ val: nextHundred, label: `ทอน ฿${(nextHundred - totalAmount).toFixed(2)}` }] : []),
    ...(totalAmount <= 500 ? [{ val: 500, label: `ทอน ฿${(500 - totalAmount).toFixed(2)}` }] : []),
    ...(totalAmount <= 1000 ? [{ val: 1000, label: `ทอน ฿${(1000 - totalAmount).toFixed(2)}` }] : []),
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
          background: #f9fafb;
        }

        .fs-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /*  ฝั่งซ้าย (ทวนออเดอร์) */
        .split-left {
          width: 40%;
          background: #ffffff;
          border-right: 1px solid #f3f4f6;
          display: flex;
          flex-direction: column;
        }
        
        .order-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f3f4f6;
        }

        .order-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 32px;
        }

        .order-row {
          padding: 24px 0;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .order-row:last-child {
            border-bottom: none;
        }

        /* 👉 ปรับขนาด Qty Badge ให้ใหญ่ขึ้น */
        .qty-badge {
          width: 32px;
          height: 32px;
          background: #e6f7f1;
          color: #00694b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          margin-top: 2px;
        }

        .order-summary-footer {
          padding: 24px 32px;
          border-top: 1px solid #f3f4f6;
          background: #fcfcfc;
        }

        .total-card {
          border-top: 1px solid #f3f4f6;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 16px;
        }

        /* 👉 ฝั่งขวา (เลือกชำระเงิน) */
        .split-right {
          width: 60%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          padding: 40px 60px;
          overflow-y: auto;
        }

        .method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 32px;
          margin-bottom: 32px;
        }

        .method-btn {
          height: 120px;
          border-radius: 16px;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: 0.2s;
          font-size: 16px;
          font-weight: 700;
          color: #4b5563;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        
        .method-btn.cash {
          background: #bbf7d0;
          color: #065f46;
        }
        
        .method-btn.promptpay {
          background: #f9fafb;
        }

        .method-btn.promptpay.active {
          background: #ede9fe;
          color: #5b21b6;
        }
        
        .method-btn:hover:not(.cash):not(.active) { background: #f3f4f6; }

        .tender-box {
          background: #eff6ff;
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025);
        }

        .cash-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .cash-btn {
          background: #ffffff;
          border-radius: 16px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: 0.2s;
          color: #374151;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .cash-btn:hover:not(.active) { background: #f9fafb; }
        
        .cash-btn.active {
          background: #00694b;
          color: #ffffff;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          margin-top: auto;
          padding-top: 32px;
        }

        .btn-cancel {
          width: 30%;
          background: #f3f4f6;
          color: #4b5563;
          border: none;
          border-radius: 16px;
          height: 64px;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        
        .btn-cancel:hover { background: #e5e7eb; }

        .btn-confirm {
          width: 70%;
          background: #00694b;
          color: #ffffff;
          border: none;
          border-radius: 16px;
          height: 64px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0,105,75,0.2);
        }
      `}</style>

      <div className="payment-fullscreen">

        <div className="fs-body">

          {/* --- ฝั่งซ้าย: ทวนออเดอร์ --- */}
          <div className="split-left">
            <div className="order-header">
              {/* 👉 ขยาย Header */}
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>รายการออร์เดอร์</h2>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Order #{orderId} • {itemCount} รายการ</div>
            </div>

            <div className="order-list custom-scrollbar">
              {cart.map((item, index) => (
                <div key={item.id || index} className="order-row">
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="qty-badge">{item.qty}x</div>
                    <div>
                      {/* 👉 ขยายชื่อเมนู (16px) และรายละเอียด (14px) */}
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '14px', color: '#9ca3af' }}>{item.detail}</div>
                      {item.extras && item.extras !== "ไม่มีเพิ่มเติม" && <div style={{ fontSize: '14px', color: '#9ca3af' }}>{item.extras}</div>}
                      {item.note && <div style={{ fontSize: '14px', color: '#00694b', fontWeight: 600, marginTop: '4px' }}>* {item.note}</div>}
                    </div>
                  </div>
                  {/* 👉 ขยายราคาต่อรายการ (18px) */}
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                    ฿{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary-footer">
              {/* 👉 ขยาย Summary (16px) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#4b5563', marginBottom: '12px' }}>
                <span>ยอดรวมย่อย (Subtotal)</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>฿{totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#059669', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  ส่วนลดพิเศษ (Promotion)
                </span>
                <span style={{ fontWeight: 700 }}>-฿0.00</span>
              </div>
              {/* 👉 ขยาย VAT (14px) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#9ca3af' }}>
                <span>ภาษีมูลค่าเพิ่ม VAT 7% (รวมในราคาแล้ว)</span>
                <span>฿{(totalAmount * 7 / 107).toFixed(2)}</span>
              </div>

              <div className="total-card">
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>ยอดชำระสุทธิ (TOTAL DUE)</div>
                  {/* 👉 ขยายยอดชำระสุทธิเป็น 36px */}
                  <div style={{ fontSize: '36px', fontWeight: 800, color: '#004f37', lineHeight: '1' }}>฿{totalAmount.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#d1fae5', color: '#059669', fontSize: '13px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', marginBottom: '8px', display: 'inline-block' }}>รอชำระเงิน</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>{itemCount} items</div>
                </div>
              </div>
            </div>
          </div>


          {/* --- ฝั่งขวา: เลือกวิธีชำระเงิน --- */}
          <div className="split-right custom-scrollbar">
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: '#111827' }}>เลือกวิธีชำระเงิน</h2>

            <div className="method-grid">
              <button
                className={`method-btn ${activeMethod === 'cash' ? 'cash' : 'promptpay'}`}
                onClick={() => setActiveMethod('cash')}
              >
                <div style={{ width: '40px', height: '40px', background: activeMethod === 'cash' ? '#00694b' : '#e5e7eb', color: activeMethod === 'cash' ? '#ffffff' : '#9ca3af', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                </div>
                <span style={{ fontSize: '16px' }}>เงินสด</span>
              </button>

              <button
                className={`method-btn promptpay ${activeMethod === 'promptpay' ? 'active' : ''}`}
                onClick={() => setActiveMethod('promptpay')}
              >
                <div style={{ width: '40px', height: '40px', background: activeMethod === 'promptpay' ? '#5b21b6' : '#e5e7eb', color: activeMethod === 'promptpay' ? '#ffffff' : '#9ca3af', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
                </div>
                <span style={{ fontSize: '16px' }}>พร้อมเพย์</span>
              </button>
            </div>

            {activeMethod === 'cash' && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>
                  บันทึกรับเงินสด
                </h3>
              </div>
            )}

            <div className="tender-box">
              {activeMethod === 'cash' ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#000000' }}>ยอดรับ: ฿{totalAmount.toFixed(2)}</div>

                  <div className="cash-grid">
                    {uniqueCashOptions.map((cash, i) => (
                      <button
                        key={i}
                        className={`cash-btn ${cashGiven === cash.val ? 'active' : ''}`}
                        onClick={() => setCashGiven(cash.val)}
                      >
                        <span style={{ fontSize: '22px', fontWeight: 700 }}>฿{cash.val}</span>
                        {cash.label && (
                          <span style={{ fontSize: '13px', color: cashGiven === cash.val ? '#a7f3d0' : '#9ca3af', marginTop: '4px' }}>
                            {cash.label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                  <div style={{ width: '140px', height: '140px', background: '#ffffff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <svg width="60" height="60" fill="none" stroke="#e5e7eb" strokeWidth="1"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
                  </div>
                  <div style={{ fontSize: '14px', color: '#4b5563' }}>รอการสแกนและยืนยันจากธนาคาร...</div>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button className="btn-cancel" onClick={onClose}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
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