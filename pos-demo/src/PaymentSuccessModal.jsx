import React, { useState } from "react";
import { printReceipt } from "./Receiptprinter"; // ต้องสะกดตรงกับชื่อไฟล์จริง (ตัวพิมพ์เล็ก/ใหญ่)

export default function PaymentSuccessModal({ 
  paymentData, 
  onClose, 
  onNewOrder 
}) {
  const { totalAmount = 0, changeAmount = 0, cashGiven = 0, method = 'cash', cart = [], orderId = 'A-108', cashierName = 'แคชเชียร์ 01' } = paymentData || {};
  
  // เก็บเวลา/เลขคิว/เลขใบเสร็จไว้ครั้งเดียว ไม่สุ่มใหม่ทุกครั้งที่ re-render
  const [now] = useState(() => new Date());
  const [queueNo] = useState(() => `Q${Math.floor(Math.random() * 100) + 1}`);
  const [receiptNo] = useState(() => `Q/00${Math.floor(Math.random() * 100000)}`);

  const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

  // เปิดหน้าใบเสร็จ (แท็บใหม่) — ตัวสร้างใบเสร็จอยู่ใน receiptPrinter
  const handlePrintReceipt = () => {
    const ok = printReceipt({
      totalAmount,
      method,
      cart,
      orderId,
      receiptNo,
      queueNo,
      cashierName,
      date: now,
      onNewOrder, // ทำให้มีปุ่ม "เริ่มออเดอร์ใหม่" ในหน้าใบเสร็จ
    });
    if (!ok) alert('บราวเซอร์บล็อก Pop-up อยู่ กรุณาอนุญาตเพื่อเปิดใบเสร็จครับ');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', zIndex: 1300 }}>
      
      <style>{`
        /* --- ชุด CSS Animation หน้าสรุป --- */

        @keyframes rippleOut {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        @keyframes popIn {
          0% { transform: scale(0.3); opacity: 0; box-shadow: 0 0 0 rgba(0, 105, 75, 0); }
          50% { transform: scale(1.15); box-shadow: 0 0 40px rgba(0, 105, 75, 0.45); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 10px 25px rgba(0, 105, 75, 0.2); }
        }

        @keyframes drawCheck {
          0% { stroke-dashoffset: 30; }
          70% { stroke-dashoffset: -2; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fs-success-layout {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Prompt', sans-serif;
          background: #ffffff; 
        }

        .fs-body-centered {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          overflow-y: auto;
          background: #ffffff;
        }

        .success-content {
          width: 100%;
          max-width: 600px; 
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn 0.5s ease-out 0.2s both; 
        }

        .success-icon-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ripple-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid #00694b;
          animation: rippleOut 1s ease-out 0.15s both;
          pointer-events: none;
        }

        .ripple-ring.delay-2 {
          animation-delay: 0.3s;
        }

        .success-icon-circle {
          position: relative;
          width: 96px;
          height: 96px;
          background: #00694b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .animated-check {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: drawCheck 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.4s forwards;
        }

        .receipt-box {
          background: #f4f6fb;
          border-radius: 20px;
          width: 100%;
          padding: 32px;
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid #e7eeff;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          width: 100%;
          margin-top: 40px;
        }

        .btn-print {
          background: #00694b;
          color: white;
          border: none;
          border-radius: 16px;
          height: 64px; 
          font-size: 18px;
          font-weight: 700;
          flex: 1;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(0, 105, 75, 0.2);
        }
        .btn-print:hover { background: #004f37; }
      `}</style>

      <div className="fs-success-layout">
        <div className="fs-body-centered">
          
          <div className="success-icon-wrap">
            <div className="ripple-ring"></div>
            <div className="ripple-ring delay-2"></div>
            <div className="success-icon-circle">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path className="animated-check" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="success-content">
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>ชำระเงินสำเร็จ</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>ทำรายการเสร็จสิ้น กรุณาส่งมอบใบเสร็จให้ลูกค้า</p>

            <div className="receipt-box">
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px dashed #d1d5db', paddingBottom: '20px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#4b5563' }}>ยอดรวมสุทธิ</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Total Amount</div>
                  <div style={{ fontSize: '40px', fontWeight: 800, color: '#111827' }}>฿{totalAmount.toFixed(2)}</div>
                </div>
                {method === 'cash' && (
                  <div style={{ flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#4b5563' }}>เงินทอน</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Change Due</div>
                    <div style={{ fontSize: '40px', fontWeight: 800, color: '#111827' }}>฿{changeAmount.toFixed(2)}</div>
                  </div>
                )}
              </div>

              <div className="receipt-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#4b5563' }}>รับเงินมา</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{method === 'cash' ? 'Cash Received' : 'Transfer Amount'}</div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                  ฿{(method === 'cash' ? cashGiven : totalAmount).toFixed(2)}
                </div>
              </div>

              <div className="receipt-row" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '4px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#4b5563' }}>วิธีชำระเงิน</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Payment Method</div>
                </div>
                <div style={{ background: '#e7eeff', color: '#1e3a8a', padding: '6px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: 700 }}>
                  {method === 'cash' ? 'เงินสด (Cash)' : 'พร้อมเพย์ (PromptPay)'}
                </div>
              </div>

              <div className="receipt-row">
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>เวลาทำรายการ</div>
                  <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>{dateString} • {timeString} น.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>หมายเลขคิว</div>
                  <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 700 }}>{queueNo}</div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-print" onClick={handlePrintReceipt}>
                พิมพ์ใบเสร็จ<br/>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}