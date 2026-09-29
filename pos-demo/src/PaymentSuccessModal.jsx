import React, { useState } from "react";

export default function PaymentSuccessModal({ 
  paymentData, 
  onClose, 
  onNewOrder 
}) {
  const { totalAmount = 0, changeAmount = 0, cashGiven = 0, method = 'cash', cart = [], orderId = 'A-108', cashierName = 'แคชเชียร์ 01' } = paymentData || {};
  
  const now = new Date();
  const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const shortDateString = now.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const queueNo = `Q${Math.floor(Math.random() * 100) + 1}`;
  const receiptNo = `Q/00${Math.floor(Math.random() * 100000)}`;

  const vat = (totalAmount * 7 / 107);
  const beforeTax = totalAmount - vat;

  // ฟังก์ชันเปิดหน้าจอใบเสร็จ (New Tab) พร้อม Animation ไหลลงมา
  const handlePrintReceipt = () => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="utf-8">
        <title>Receipt ${orderId}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
        <style>
          /* ปรับ Body ให้รองรับการไหลของกระดาษ */
          body { background: #f4f6fb; margin: 0; padding: 0; font-family: 'Space Mono', monospace; overflow-x: hidden; }
          
          /* แถบจำลองช่องปริ้นเตอร์ด้านบน */
          .printer-slot {
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 24px;
            background: #1f2937;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 50;
          }
          .printer-slot::after {
            content: '';
            position: absolute;
            bottom: 0; left: 50%;
            transform: translateX(-50%);
            width: 350px;
            height: 6px;
            background: #000;
            border-radius: 4px 4px 0 0;
          }

          /* กรอบสำหรับซ่อนกระดาษที่ยังไม่ไหลออกมา */
          .receipt-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
            overflow: hidden; /* ซ่อนส่วนที่อยู่สูงกว่าขอบ */
            padding-top: 24px; /* เว้นระยะให้ช่องปริ้น */
            padding-bottom: 60px;
            min-height: 100vh;
          }

          /* แอนิเมชันให้กระดาษไหลลงมาเหมือนเครื่องปริ้น */
          @keyframes printOut {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(0); }
          }

          .receipt-container { 
            width: 100%; 
            max-width: 340px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            /* สั่งให้เล่นแอนิเมชัน 1.5 วินาที ตอนเปิดหน้า */
            animation: printOut 1.5s cubic-bezier(0.3, 0.8, 0.4, 1) forwards;
          }

          .receipt-paper { background: white; width: 100%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); color: #111827; }
          .dashed { border-top: 1px dashed #d1d5db; margin: 12px 0; }
          .thick-dashed { border-top: 2px dashed #9ca3af; margin: 12px 0; }
          .jagged-edge { width: 100%; height: 12px; display: block; }
          .jagged-edge svg { width: 100%; height: 100%; fill: #ffffff; }
          
          /* กรณีสั่งปริ้นจริง ให้ซ่อนส่วนที่ใช้จำลอง UI */
          @media print {
            body { background: white; padding: 0; }
            .printer-slot { display: none !important; }
            .receipt-wrapper { padding-top: 0; overflow: visible; }
            .receipt-container { max-width: 100%; box-shadow: none; margin: 0; padding: 0; animation: none !important; transform: none !important; }
            .receipt-paper { box-shadow: none; padding: 0; }
            .no-print { display: none !important; }
            .jagged-edge { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="printer-slot no-print"></div>
        <div class="receipt-wrapper">
          <div class="receipt-container">
            <div class="jagged-edge" style="filter: drop-shadow(0 -2px 2px rgba(0,0,0,0.02));">
              <svg preserveAspectRatio="none" viewBox="0 0 340 10">
                <polygon points="0,10 5,0 10,10 15,0 20,10 25,0 30,10 35,0 40,10 45,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10 105,0 110,10 115,0 120,10 125,0 130,10 135,0 140,10 145,0 150,10 155,0 160,10 165,0 170,10 175,0 180,10 185,0 190,10 195,0 200,10 205,0 210,10 215,0 220,10 225,0 230,10 235,0 240,10 245,0 250,10 255,0 260,10 265,0 270,10 275,0 280,10 285,0 290,10 295,0 300,10 305,0 310,10 315,0 320,10 325,0 330,10 335,0 340,10"></polygon>
              </svg>
            </div>

            <div class="receipt-paper">
              <div class="text-center mb-2">
                <div class="text-xs text-gray-600 font-bold tracking-[1px]">QUEUE NO.</div>
                <div class="text-5xl font-extrabold leading-tight">${queueNo}</div>
              </div>

              <div class="dashed"></div>

              <div class="text-center text-xs text-gray-600 my-2 leading-relaxed">
                <div class="text-lg font-bold text-gray-900 mb-1">Normal4th Coffee</div>
                <div>Normal4th Coffee KKU</div>
                <div class="px-4 mt-1">140/355 Kanlapaphruek Rd, Mueang Khon Kaen District, Khon Kaen 40000</div>
                <div class="mt-1">Tel: 063-2549169</div>
                <div>TAX ID: 0413564001804</div>
              </div>

              <div class="text-center my-3">
                <div class="text-base font-bold">RECEIPT</div>
                <div class="text-[11px] text-gray-500">(ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ)</div>
              </div>

              <div class="dashed"></div>

              <div class="text-[12px] my-2 leading-relaxed space-y-1">
                <div class="flex justify-between"><span>NO.: ${receiptNo}</span></div>
                <div class="flex justify-between"><span>Queue: ${queueNo}</span></div>
                <div class="flex justify-between"><span>Staff: ${cashierName}</span></div>
                <div class="flex justify-between"><span>Guests: 1</span><span>ID: NCLT1</span></div>
                <div class="flex justify-between mt-1"><span>Date: ${shortDateString}</span><span>Time: ${timeString}</span></div>
              </div>

              <div class="dashed"></div>

              <div class="text-[13px] my-3 space-y-3">
                ${cart.map(item => `
                  <div>
                    <div class="flex justify-between font-bold">
                      <div><span class="inline-block w-4 text-right mr-2">${item.qty}</span>${item.name}</div>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                    <div class="pl-8 text-[11px] text-gray-600 mt-1 leading-snug">
                      ${item.detail ? `<div>${item.detail}</div>` : ''}
                      ${item.extras && item.extras !== "ไม่มีเพิ่มเติม" ? `<div>+ ${item.extras}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="dashed"></div>

              <div class="text-[13px] my-3">
                <div class="flex justify-between items-center text-xs">
                  <span>Items: ${cart.reduce((s, i) => s + i.qty, 0)}</span>
                  <div class="flex gap-4">
                    <span>Subtotal:</span>
                    <span class="w-14 text-right">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div class="thick-dashed"></div>

                <div class="flex justify-between items-center text-base font-bold">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>

                <div class="thick-dashed"></div>

                <div class="flex justify-between items-center text-xs mt-2">
                  <span>${method === 'cash' ? 'เงินสด (Cash)' : 'โอนเงิน QR Code'}</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div class="dashed"></div>

              <div class="text-[12px] text-gray-600 my-2 space-y-1">
                <div class="flex justify-between"><span>Before TAX</span><span>${beforeTax.toFixed(2)}</span></div>
                <div class="flex justify-between"><span>TAX 7%</span><span>${vat.toFixed(2)}</span></div>
              </div>

              <div class="dashed"></div>

              <div class="text-center my-3 text-[12px] text-gray-600 space-y-2">
                <div class="italic text-gray-900">Everyday's Simple Pleasure :)</div>
                <div class="text-[11px]">Wi-Fi: Normal4th KKU<br>password : itsadecentcup</div>
              </div>

              <div class="flex flex-col items-center my-4">
                <div class="flex items-end justify-between h-8 w-44 opacity-80 mb-1">
                  ${Array.from({length: 24}).map(() => `<div class="bg-black h-full" style="width: ${Math.random() > 0.5 ? '2px' : '4px'}"></div>`).join('')}
                </div>
                <div class="text-[10px] tracking-[2px] text-gray-600">${receiptNo}-${queueNo}</div>
              </div>

              <div class="text-center text-[10px] text-gray-500 mt-3 tracking-widest">*** THANK YOU / ขอบคุณที่ใช้บริการ ***</div>
            </div>

            <div class="jagged-edge" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
              <svg preserveAspectRatio="none" viewBox="0 0 340 10">
                <polygon points="0,0 5,10 10,0 15,10 20,0 25,10 30,0 35,10 40,0 45,10 50,0 55,10 60,0 65,10 70,0 75,10 80,0 85,10 90,0 95,10 100,0 105,10 110,0 115,10 120,0 125,10 130,0 135,10 140,0 145,10 150,0 155,10 160,0 165,10 170,0 175,10 180,0 185,10 190,0 195,10 200,0 205,10 210,0 215,10 220,0 225,10 230,0 235,10 240,0 245,10 250,0 255,10 260,0 265,10 270,0 275,10 280,0 285,10 290,0 295,10 300,0 305,10 310,0 315,10 320,0 325,10 330,0 335,10 340,0"></polygon>
              </svg>
            </div>

            <div class="mt-6 flex w-full gap-3 no-print">
              <button onclick="window.print()" class="flex-1 bg-[#00694b] hover:bg-[#004f37] text-white py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-md">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                สั่งพิมพ์ (Print)
              </button>
            </div>
          </div>
        </div>
        <script>
          // รอ 1.5 วินาที ให้ Animation ใบเสร็จไหลลงมาจนจบก่อน แล้วค่อยเด้งคำสั่งปริ้น
          setTimeout(() => { window.print(); }, 1500);
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    } else {
      alert('บราวเซอร์บล็อก Pop-up อยู่ กรุณาอนุญาตเพื่อเปิดใบเสร็จครับ');
    }
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

        .btn-new-order {
          background: #ffffff;
          color: #111827;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          height: 64px; 
          font-size: 18px;
          font-weight: 700;
          flex: 1;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-new-order:hover { background: #f3f4f6; border-color: #d1d5db; }
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
              <button className="btn-new-order" onClick={onNewOrder}>
                เริ่มออเดอร์ใหม่<br/>
              </button>
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