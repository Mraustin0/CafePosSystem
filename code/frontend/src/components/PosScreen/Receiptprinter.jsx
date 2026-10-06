/**
 * receiptPrinter.js
 * ฟังก์ชันกลางสำหรับเปิดหน้าใบเสร็จ + สั่งพิมพ์
 * (ย้ายมาจาก handlePrintReceipt ใน PaymentSuccessModal เพื่อให้ใช้ร่วมกับหน้าจัดการบิลได้)
 *
 * คืนค่า true ถ้าเปิดหน้าต่างได้ / false ถ้าถูกบราวเซอร์บล็อก Pop-up
 */

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function printReceipt({
  totalAmount = 0,
  method = 'cash',            // 'cash' | 'promptpay' (อย่างอื่นถือเป็น QR)
  cart = [],                  // [{ name, qty, price(ต่อหน่วย), detail?, extras? }]
  orderId = 'A-108',
  receiptNo = 'Q/000000',
  queueNo = 'Q1',
  cashierName = 'แคชเชียร์ 01',
  date = new Date(),          // เวลาของธุรกรรม (ใช้เวลาเดิมของบิลเมื่อพิมพ์ซ้ำ)
  isReprint = false,          // true = แสดงป้าย "สำเนา (REPRINT)"
  onNewOrder = null,          // ถ้าส่งมา จะมีปุ่ม "เริ่มออเดอร์ใหม่" ในหน้าใบเสร็จ
} = {}) {
  const timeString = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const shortDateString = date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const vat = (totalAmount * 7) / 107;
  const beforeTax = totalAmount - vat;

  const receiptHTML = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="utf-8">
        <title>Receipt ${esc(orderId)}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
        <style>
          body { background: #f4f6fb; margin: 0; padding: 0; font-family: 'Space Mono', monospace; overflow-x: hidden; }

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

          .receipt-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
            overflow: hidden;
            padding-top: 24px;
            padding-bottom: 60px;
            min-height: 100vh;
          }

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
            animation: printOut 1.5s cubic-bezier(0.3, 0.8, 0.4, 1) forwards;
          }

          .receipt-paper { background: white; width: 100%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); color: #111827; }
          .dashed { border-top: 1px dashed #d1d5db; margin: 12px 0; }
          .thick-dashed { border-top: 2px dashed #9ca3af; margin: 12px 0; }
          .jagged-edge { width: 100%; height: 12px; display: block; }
          .jagged-edge svg { width: 100%; height: 100%; fill: #ffffff; }

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
                <div class="text-5xl font-extrabold leading-tight">${esc(queueNo)}</div>
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
                ${isReprint ? `<div class="mt-2 inline-block border border-gray-800 px-3 py-0.5 text-[11px] font-bold tracking-[2px]">สำเนา (REPRINT)</div>` : ''}
              </div>

              <div class="dashed"></div>

              <div class="text-[12px] my-2 leading-relaxed space-y-1">
                <div class="flex justify-between"><span>NO.: ${esc(receiptNo)}</span></div>
                <div class="flex justify-between"><span>Queue: ${esc(queueNo)}</span></div>
                <div class="flex justify-between"><span>Staff: ${esc(cashierName)}</span></div>
                <div class="flex justify-between"><span>Guests: 1</span><span>ID: NCLT1</span></div>
                <div class="flex justify-between mt-1"><span>Date: ${shortDateString}</span><span>Time: ${timeString}</span></div>
              </div>

              <div class="dashed"></div>

              <div class="text-[13px] my-3 space-y-3">
                ${cart.map(item => `
                  <div>
                    <div class="flex justify-between font-bold">
                      <div><span class="inline-block w-4 text-right mr-2">${item.qty}</span>${esc(item.name)}</div>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                    <div class="pl-8 text-[11px] text-gray-600 mt-1 leading-snug">
                      ${item.detail ? `<div>${esc(item.detail)}</div>` : ''}
                      ${item.extras && item.extras !== "ไม่มีเพิ่มเติม" ? `<div>+ ${esc(item.extras)}</div>` : ''}
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
                  ${Array.from({ length: 24 }).map(() => `<div class="bg-black h-full" style="width: ${Math.random() > 0.5 ? '2px' : '4px'}"></div>`).join('')}
                </div>
                <div class="text-[10px] tracking-[2px] text-gray-600">${esc(receiptNo)}-${esc(queueNo)}</div>
              </div>

              <div class="text-center text-[10px] text-gray-500 mt-3 tracking-widest">*** THANK YOU / ขอบคุณที่ใช้บริการ ***</div>
            </div>

            <div class="jagged-edge" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
              <svg preserveAspectRatio="none" viewBox="0 0 340 10">
                <polygon points="0,0 5,10 10,0 15,10 20,0 25,10 30,0 35,10 40,0 45,10 50,0 55,10 60,0 65,10 70,0 75,10 80,0 85,10 90,0 95,10 100,0 105,10 110,0 115,10 120,0 125,10 130,0 135,10 140,0 145,10 150,0 155,10 160,0 165,10 170,0 175,10 180,0 185,10 190,0 195,10 200,0 205,10 210,0 215,10 220,0 225,10 230,0 235,10 240,0 245,10 250,0 255,10 260,0 265,10 270,0 275,10 280,0 285,10 290,0 295,10 300,0 305,10 310,0 315,10 320,0 325,10 330,0 335,10 340,0"></polygon>
              </svg>
            </div>

            <div class="mt-6 flex w-full gap-3 no-print">
              ${onNewOrder ? `
              <button id="btn-new-order" class="flex-1 bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-200 py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2">
                เริ่มออเดอร์ใหม่
              </button>` : ''}
              <button onclick="window.print()" class="flex-1 bg-[#00694b] hover:bg-[#004f37] text-white py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-md">
                สั่งพิมพ์
              </button>
            </div>
          </div>
        </div>
        <script>
          // รอให้ Animation ใบเสร็จไหลลงมาจนจบก่อน แล้วค่อยเรียกหน้าต่างสั่งพิมพ์
          setTimeout(() => { window.print(); }, 1500);
        </script>
      </body>
      </html>
    `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(receiptHTML);
  printWindow.document.close();

  // ผูกปุ่ม "เริ่มออเดอร์ใหม่" -> เรียก callback ของหน้า POS แล้วปิดแท็บใบเสร็จ
  if (onNewOrder) {
    const btn = printWindow.document.getElementById('btn-new-order');
    if (btn) {
      btn.addEventListener('click', () => {
        onNewOrder();
        printWindow.close();
      });
    }
  }
  return true;
}