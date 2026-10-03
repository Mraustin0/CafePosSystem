import React, { useState, useMemo } from 'react';
import './BillManagementView.css';
import { printReceipt } from './Receiptprinter';

/* ---------------------------------------------------------
   Mock data — ทุกบิลคือรายการที่ชำระเงินสำเร็จแล้วเท่านั้น
--------------------------------------------------------- */
const TODAY = '2026-09-28';

const PAYMENT_FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'cash', label: 'เงินสด (Cash)' },
  { key: 'promptpay', label: 'PromptPay QR' },
];

const SORT_OPTIONS = [
  { key: 'latest', label: 'ล่าสุดก่อน' },
  { key: 'oldest', label: 'เก่าสุดก่อน' },
  { key: 'high', label: 'ยอดสูง → ต่ำ' },
  { key: 'low', label: 'ยอดต่ำ → สูง' },
];

const DATE_TABS = [
  { key: 'today', label: 'วันนี้', title: 'วันนี้' },
  { key: 'week', label: 'สัปดาห์นี้', title: 'สัปดาห์นี้' },
  { key: 'month', label: 'เดือนนี้', title: 'เดือนนี้' },
];

const MOCK_BILLS = [
  {
    id: '#INV-20260928-001',
    type: 'ทานที่ร้าน (โต๊ะ 3)',
    typeClass: 'dine-in',
    cashier: 'Alex',
    payment: 'promptpay',
    paymentLabel: 'PromptPay QR',
    timestamp: '2026-09-28T14:30',
    datetime: '28/09/2026 14:30 น.',
    txnId: 'TXN-20260928-884920',
    payTime: '14:30:23 น.',
    total: 355.5,
    items: [
      { name: '1. คาปูชิโน่เย็น (Iced Cappuccino)', detail: 'หวาน 50%, คั่วกลาง, เพิ่ม Extra Shot (+฿15)', meta: 'โน้ต: แยกน้ำแข็ง • จำนวน 1 แก้ว', price: 95.0 },
      { name: '2. Poached Egg (Large)', detail: 'เสิร์ฟพร้อมสลัดผักเคียง', meta: 'จำนวน: 2 ที่ (ที่ละ ฿80.00)', price: 160.0 },
      { name: '3. Coronation Sandwich', detail: 'ขนมปังโฮลวีต', meta: 'จำนวน: 1 ที่', price: 70.0 },
      { name: '4. คุกกี้ ช็อกโกแลตชิพ (Chocolate Chip Cookie)', detail: 'อุ่นร้อน 30 วินาที', meta: 'จำนวน: 1 ชิ้น', price: 30.5 },
    ],
  },
  {
    id: '#INV-20260928-002',
    type: 'รับกลับบ้าน',
    typeClass: 'takeaway',
    cashier: 'Alex',
    payment: 'cash',
    paymentLabel: 'เงินสด (Cash)',
    timestamp: '2026-09-28T14:15',
    datetime: '28/09/2026 14:15 น.',
    txnId: 'TXN-20260928-884871',
    payTime: '14:15:40 น.',
    total: 185.0,
    items: [
      { name: '1. ชาไทยพรีเมียม (Iced Premium Thai Tea)', detail: 'หวาน 50% (Less Sweet), ฟองนม', meta: 'จำนวน: 2 แก้ว (แก้วละ ฿70.00)', price: 140.0 },
      { name: '2. คุกกี้ช็อกโกแลตชิพ (Chocolate Chip Cookie)', detail: 'อุ่นร้อน 30 วินาที', meta: 'จำนวน: 1 ชิ้น', price: 45.0 },
    ],
  },
  {
    id: '#INV-20260928-003',
    type: 'ทานที่ร้าน',
    typeClass: 'dine-in',
    cashier: 'Sarah',
    payment: 'promptpay',
    paymentLabel: 'PromptPay QR',
    timestamp: '2026-09-28T14:05',
    datetime: '28/09/2026 14:05 น.',
    txnId: 'TXN-20260928-884833',
    payTime: '14:05:12 น.',
    total: 255.0,
    items: [
      { name: '1. Dirty Coffee', detail: 'เมล็ด Special Blend', meta: 'จำนวน: 1 แก้ว', price: 120.0 },
      { name: '2. Butter Croissant', detail: 'อุ่นร้อน', meta: 'จำนวน: 2 ชิ้น (ชิ้นละ ฿67.50)', price: 135.0 },
    ],
  },
  {
    id: '#INV-20260928-004',
    type: 'รับกลับบ้าน',
    typeClass: 'takeaway',
    cashier: 'Alex',
    payment: 'promptpay',
    paymentLabel: 'QR PromptPay',
    timestamp: '2026-09-28T13:50',
    datetime: '28/09/2026 13:50 น.',
    txnId: 'TXN-20260928-884790',
    payTime: '13:50:31 น.',
    total: 110.0,
    items: [
      { name: '1. Iced Americano', detail: 'คั่วเข้ม, หวาน 0%', meta: 'จำนวน: 2 แก้ว (แก้วละ ฿55.00)', price: 110.0 },
    ],
  },
];

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ราคาสินค้ารวม VAT แล้ว: VAT = ยอดรวม × 7 / 107
const calcVat = (total) => (total * 7) / 107;

const summarize = (items) =>
  items
    .map((it) => it.name.replace(/^\d+\.\s*/, '').replace(/\s*\(.*\)\s*$/, ''))
    .join(', ');

// แปลงข้อมูลบิล -> รูปแบบที่ printReceipt ต้องการ
// หมายเหตุ: mock data ยังไม่มี field qty จึงอ่านจากข้อความใน meta ("จำนวน 2 ...")
// เมื่อต่อ API จริง ให้ส่ง qty / unitPrice มาใน items แล้วใช้ค่านั้นแทน
const billToReceipt = (bill) => {
  const cart = bill.items.map((it) => {
    const qty = parseInt((it.meta.match(/จำนวน:?\s*(\d+)/) || [])[1], 10) || 1;
    return {
      name: it.name.replace(/^\d+\.\s*/, ''),
      qty,
      price: it.price / qty, // ราคาต่อหน่วย (printReceipt จะคูณ qty เอง)
      detail: it.detail,
    };
  });
  const seq = parseInt(bill.id.slice(-3), 10) || 1;

  return {
    totalAmount: bill.total,
    method: bill.payment,
    cart,
    orderId: bill.id,
    receiptNo: bill.id.replace('#', ''),
    queueNo: `Q${seq}`,
    cashierName: bill.cashier,
    date: new Date(bill.timestamp),
    isReprint: true,
  };
};

const daysBetween = (isoA, isoB) =>
  Math.floor((new Date(isoA).setHours(0, 0, 0, 0) - new Date(isoB).setHours(0, 0, 0, 0)) / 86400000);

/* ---------------------------------------------------------
   Component
--------------------------------------------------------- */
export default function BillManagementView() {
  const [selectedId, setSelectedId] = useState(MOCK_BILLS[0].id);
  const [dateTab, setDateTab] = useState('today');
  const [customFrom, setCustomFrom] = useState(TODAY);
  const [customTo, setCustomTo] = useState(TODAY);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [toast, setToast] = useState('');

  const visibleBills = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = MOCK_BILLS.filter((bill) => {
      const day = bill.timestamp.slice(0, 10);
      const age = daysBetween(TODAY, day);

      if (dateTab === 'today' && day !== TODAY) return false;
      if (dateTab === 'week' && !(age >= 0 && age <= 6)) return false;
      if (dateTab === 'month' && day.slice(0, 7) !== TODAY.slice(0, 7)) return false;
      if (dateTab === 'custom' && (day < customFrom || day > customTo)) return false;

      if (paymentFilter !== 'all' && bill.payment !== paymentFilter) return false;

      if (q) {
        const haystack = [bill.id, bill.cashier, bill.txnId, summarize(bill.items)]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'oldest') return a.timestamp.localeCompare(b.timestamp);
      if (sortBy === 'high') return b.total - a.total;
      if (sortBy === 'low') return a.total - b.total;
      return b.timestamp.localeCompare(a.timestamp);
    });
    return list;
  }, [search, dateTab, customFrom, customTo, paymentFilter, sortBy]);

  const activeBill = visibleBills.find((b) => b.id === selectedId) || visibleBills[0] || null;
  const dateTitle = DATE_TABS.find((t) => t.key === dateTab).title;

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2500);
  };

  const handleReprint = () => {
    if (!activeBill) return;
    const opened = printReceipt(billToReceipt(activeBill));
    showToast(
      opened
        ? `กำลังพิมพ์ใบเสร็จ ${activeBill.id}`
        : 'บราวเซอร์บล็อก Pop-up อยู่ กรุณาอนุญาตเพื่อเปิดใบเสร็จ'
    );
  };

  return (
    <div className="bm-container">
      {/* ---------------- ฝั่งซ้าย: รายการบิล ---------------- */}
      <section className="bm-list-pane">
        <header className="bm-list-header">
          <div>
            <h2 className="bm-title">
              รายการบิลทั้งหมด <span>(Bill Management)</span>
            </h2>
            <p className="bm-subtitle">
              ตรวจสอบประวัติการขาย ดูรายละเอียด และพิมพ์ใบเสร็จซ้ำ
            </p>
          </div>

          <div className="bm-header-right">
            <span className="bm-count-pill">
              ทั้งหมด {visibleBills.length} บิล ({dateTitle})
            </span>
            <button type="button" className="bm-btn bm-btn--tool">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                <path d="M3 12A9 9 0 0 1 18.5 5.8L21 8" />
                <path d="M21 3v5h-5M3 21v-5h5" />
              </svg>
              <span>รีเฟรชข้อมูล</span>
            </button>
            <button type="button" className="bm-btn bm-btn--tool">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5" />
                <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
              </svg>
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </header>

        {/* แถบค้นหา + ช่วงเวลา */}
        <div className="bm-toolbar">
          <label className="bm-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขที่บิล, ชื่อลูกค้า หรือชื่อพนักงาน..."
              autoComplete="off"
            />
          </label>

          <div className="bm-tabs" role="tablist">
            {DATE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={dateTab === tab.key}
                className={`bm-tab ${dateTab === tab.key ? 'active' : ''}`}
                onClick={() => setDateTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {dateTab === 'custom' && (
          <div className="bm-custom-range">
            <label>
              ตั้งแต่
              <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} />
            </label>
            <label>
              ถึง
              <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} />
            </label>
          </div>
        )}

        {/* ช่องทางชำระ + เรียงตาม */}
        <div className="bm-filterbar">
          <label className="bm-select-wrap">
            <span>ช่องทางชำระ:</span>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              {PAYMENT_FILTERS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label className="bm-select-wrap bm-select-wrap--sort">
            <span>เรียงตาม:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* การ์ดบิล */}
        <div className="bm-cards">
          {visibleBills.map((bill, index) => {
            const isActive = activeBill && activeBill.id === bill.id;
            return (
              <article
                key={bill.id}
                className={`bm-card ${isActive ? 'selected' : ''}`}
                onClick={() => setSelectedId(bill.id)}
              >
                <div className="bm-card-top">
                  <div className="bm-card-left">
                    <div className="bm-card-headline">
                      <span className="bm-card-index">{index + 1}</span>
                      <span className="bm-card-id">{bill.id}</span>
                      <span className={`bm-chip ${bill.typeClass}`}>{bill.type}</span>
                      <span className="bm-status">
                        <i className="bm-dot" />
                        ชำระแล้ว (Completed)
                      </span>
                    </div>
                    <div className="bm-card-info">
                      <span>แคชเชียร์ <strong>{bill.cashier}</strong></span>
                      <span className="bm-method">{bill.paymentLabel}</span>
                      <span>{bill.datetime}</span>
                    </div>
                  </div>

                  <div className="bm-card-right">
                    <div className="bm-card-amount">
                      <span className="bm-card-amount-label">ยอดสุทธิ</span>
                      <span className="bm-card-amount-value">฿{fmt(bill.total)}</span>
                    </div>
                    <button
                      type="button"
                      className={`bm-view-btn ${isActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(bill.id);
                      }}
                    >
                      {isActive ? 'กำลังดูบิลนี้' : 'ดูรายละเอียดบิล'}
                    </button>
                  </div>
                </div>

                <div className="bm-card-bottom">
                  <span className="bm-card-items">รายการย่อ: {summarize(bill.items)}</span>
                  <span className={`bm-card-hint ${isActive ? 'active' : ''}`}>
                    {isActive ? 'ดูข้อมูลล่าสุด' : 'เสร็จสิ้น'}
                  </span>
                </div>
              </article>
            );
          })}

          {visibleBills.length === 0 && (
            <div className="bm-empty">ไม่พบบิลที่ตรงกับเงื่อนไขที่เลือก</div>
          )}
        </div>
      </section>

      {/* ---------------- ฝั่งขวา: ใบเสร็จฉบับเต็ม ---------------- */}
      <aside className="bm-receipt-pane">
        {activeBill ? (
          <>
            <div className="bm-receipt-scroll">
              <div className="bm-receipt-shop">
                <span>Easy POS Studio • สาขาหลัก</span>
                <span>{activeBill.datetime.replace(' น.', '')} | {activeBill.payTime.replace(' น.', '')}</span>
              </div>

              <div className="bm-receipt-head">
                <div className="bm-receipt-head-left">
                  <h3 className="bm-receipt-title">รายละเอียดใบเสร็จฉบับเต็ม</h3>
                  <p className="bm-receipt-sub">
                    {activeBill.type} • แคชเชียร์ {activeBill.cashier} (กะ #04) • Terminal 01
                  </p>
                </div>
                <div className="bm-receipt-head-right">
                  <span className="bm-receipt-id">{activeBill.id}</span>
                  <span className="bm-status bm-status--pill">
                    <i className="bm-dot" />
                    ชำระแล้ว (Completed)
                  </span>
                </div>
              </div>

              {/* รายการสินค้า */}
              <div className="bm-items">
                {activeBill.items.map((item, idx) => (
                  <div className="bm-item" key={idx}>
                    <div className="bm-item-body">
                      <div className="bm-item-row">
                        <span className="bm-item-name">{item.name}</span>
                        <span className="bm-item-price">฿{fmt(item.price)}</span>
                      </div>
                      <div className="bm-item-detail">{item.detail}</div>
                      <div className="bm-item-meta">{item.meta}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* สรุปยอด */}
              <div className="bm-summary">
                <div className="bm-row">
                  <span>รวมมูลค่าสินค้า (Subtotal)</span>
                  <span>฿{fmt(activeBill.total)}</span>
                </div>
                <div className="bm-row">
                  <span>ภาษีมูลค่าเพิ่ม VAT 7% (รวมในราคา)</span>
                  <span>฿{fmt(calcVat(activeBill.total))}</span>
                </div>
                <div className="bm-row bm-row--total">
                  <span>ยอดสุทธิ (Total Paid)</span>
                  <span className="bm-total-value">฿{fmt(activeBill.total)}</span>
                </div>
              </div>

              {/* ข้อมูลการชำระเงิน */}
              <div className="bm-payment">
                <div className="bm-payment-row">
                  <span className="bm-payment-label">ช่องทางชำระ:</span>
                  <span className="bm-payment-value">{activeBill.paymentLabel}</span>
                </div>
                <div className="bm-payment-row">
                  <span className="bm-payment-label">สถานะ:</span>
                  <span className="bm-payment-value bm-payment-ok">✓ ชำระเงินเรียบร้อยแล้ว</span>
                </div>
                <div className="bm-payment-row">
                  <span className="bm-payment-label">รหัสธุรกรรม: เวลา:</span>
                  <span className="bm-payment-value bm-mono">
                    {activeBill.txnId} • {activeBill.payTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="bm-receipt-footer">
              <button type="button" className="bm-reprint" onClick={handleReprint}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V3h12v6" />
                  <path d="M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2" />
                  <path d="M6 14h12v7H6z" />
                </svg>
                พิมพ์ใบเสร็จซ้ำ (Reprint Receipt)
              </button>
            </div>
          </>
        ) : (
          <div className="bm-receipt-empty">เลือกบิลจากรายการเพื่อดูรายละเอียดใบเสร็จ</div>
        )}

        {toast && <div className="bm-toast" role="status">{toast}</div>}
      </aside>
    </div>
  );
}