import React from "react";

export default function PaymentSuccessModal({ 
  paymentData, 
  onClose, 
  onNewOrder 
}) {
  const { totalAmount = 0, changeAmount = 0, cashGiven = 0, method = 'cash', orderId = 'A-108', cashierName = 'แคชเชียร์ 01' } = paymentData || {};
  
  // สมมติเวลาปัจจุบัน
  const now = new Date();
  const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#f0f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
      
      <style>{`
        .success-card {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 10px 40px rgba(0, 79, 55, 0.08);
          font-family: 'Prompt', sans-serif;
        }

        .success-icon-circle {
          width: 80px;
          height: 80px;
          background: #00694b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 24px;
        }

        .receipt-box {
          background: #f4f6fb;
          border-radius: 16px;
          width: 100%;
          padding: 24px;
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-print {
          background: #00694b;
          color: white;
          border: none;
          border-radius: 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 700;
          flex: 1;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-print:hover { background: #004f37; }

        .btn-new-order {
          background: #ffffff;
          color: #111827;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 700;
          flex: 1;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-new-order:hover { background: #f3f4f6; }
      `}</style>

      <div className="success-card">
        
        <div className="success-icon-circle">
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>ชำระเงินสำเร็จ</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Payment Completed Successfully • <span style={{ color: '#00694b', fontWeight: 600 }}>Order #{orderId}</span></p>

        <div className="receipt-box">
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px dashed #d1d5db', paddingBottom: '16px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563' }}>ยอดรวมสุทธิ</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Total Amount</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>฿{totalAmount.toFixed(2)}</div>
            </div>
            {method === 'cash' && (
              <div style={{ flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#4b5563' }}>เงินทอน</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Change Due</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>฿{changeAmount.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="receipt-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563' }}>รับเงินมา</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{method === 'cash' ? 'Cash Received' : 'Transfer Amount'}</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              ฿{(method === 'cash' ? cashGiven : totalAmount).toFixed(2)}
            </div>
          </div>

          <div className="receipt-row" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563' }}>วิธีชำระเงิน</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Payment Method</div>
            </div>
            <div style={{ background: '#e7eeff', color: '#1e3a8a', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>
              {method === 'cash' ? 'เงินสด (Cash)' : 'พร้อมเพย์ (PromptPay)'}
            </div>
          </div>

          <div className="receipt-row">
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>เวลาทำรายการ</div>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>{dateString} • {timeString} น.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>แคชเชียร์ผู้ดูแล</div>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>{cashierName}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '32px' }}>
          <button className="btn-print" onClick={() => {
            alert('กำลังพิมพ์ใบเสร็จ...');
            onNewOrder();
          }}>
            พิมพ์ใบเสร็จ<br/><span style={{ fontSize: '11px', fontWeight: 400 }}>Print Receipt</span>
          </button>
          <button className="btn-new-order" onClick={onNewOrder}>
            ออเดอร์ใหม่<br/><span style={{ fontSize: '11px', fontWeight: 400 }}>New Order</span>
          </button>
        </div>

      </div>
    </div>
  );
}