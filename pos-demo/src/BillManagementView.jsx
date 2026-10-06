import React, { useState, useMemo, useEffect } from 'react';
import './BillManagementView.css';
import { printReceipt } from './Receiptprinter';

/* ---------------------------------------------------------
   ตั้งค่าวันที่ปัจจุบัน
--------------------------------------------------------- */
const todayObj = new Date();
const yyyy = todayObj.getFullYear();
const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
const dd = String(todayObj.getDate()).padStart(2, '0');
const TODAY = `${yyyy}-${mm}-${dd}`;
const formattedDate = `${dd}/${mm}/${yyyy}`;

export const MOCK_BILLS = [
  {
    id: `#INV-${TODAY.replace(/-/g, '')}-001`,
    type: 'ทานที่ร้าน (โต๊ะ 3)',
    typeClass: 'dine-in',
    cashier: 'Alex',
    payment: 'promptpay',
    paymentLabel: 'PromptPay QR',
    timestamp: `${TODAY}T14:30`,
    datetime: `${formattedDate} 14:30 น.`,
    txnId: `TXN-${TODAY.replace(/-/g, '')}-884920`,
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
    id: `#INV-${TODAY.replace(/-/g, '')}-002`,
    type: 'รับกลับบ้าน',
    typeClass: 'takeaway',
    cashier: 'Alex',
    payment: 'cash',
    paymentLabel: 'เงินสด (Cash)',
    timestamp: `${TODAY}T14:15`,
    datetime: `${formattedDate} 14:15 น.`,
    txnId: `TXN-${TODAY.replace(/-/g, '')}-884871`,
    payTime: '14:15:40 น.',
    total: 185.0,
    items: [
      { name: '1. ชาไทยพรีเมียม (Iced Premium Thai Tea)', detail: 'หวาน 50% (Less Sweet), ฟองนม', meta: 'จำนวน: 2 แก้ว (แก้วละ ฿70.00)', price: 140.0 },
      { name: '2. คุกกี้ช็อกโกแลตชิพ (Chocolate Chip Cookie)', detail: 'อุ่นร้อน 30 วินาที', meta: 'จำนวน: 1 ชิ้น', price: 45.0 },
    ],
  },
  {
    id: `#INV-${TODAY.replace(/-/g, '')}-003`,
    type: 'ทานที่ร้าน',
    typeClass: 'dine-in',
    cashier: 'Sarah',
    payment: 'promptpay',
    paymentLabel: 'PromptPay QR',
    timestamp: `${TODAY}T14:05`,
    datetime: `${formattedDate} 14:05 น.`,
    txnId: `TXN-${TODAY.replace(/-/g, '')}-884833`,
    payTime: '14:05:12 น.',
    total: 255.0,
    items: [
      { name: '1. Dirty Coffee', detail: 'เมล็ด Special Blend', meta: 'จำนวน: 1 แก้ว', price: 120.0 },
      { name: '2. Butter Croissant', detail: 'อุ่นร้อน', meta: 'จำนวน: 2 ชิ้น (ชิ้นละ ฿67.50)', price: 135.0 },
    ],
  },
  {
    id: `#INV-${TODAY.replace(/-/g, '')}-004`,
    type: 'รับกลับบ้าน',
    typeClass: 'takeaway',
    cashier: 'Alex',
    payment: 'promptpay',
    paymentLabel: 'PromptPay QR',
    timestamp: `${TODAY}T13:50`,
    datetime: `${formattedDate} 13:50 น.`,
    txnId: `TXN-${TODAY.replace(/-/g, '')}-884790`,
    payTime: '13:50:31 น.',
    total: 110.0,
    items: [
      { name: '1. Iced Americano', detail: 'คั่วเข้ม, หวาน 0%', meta: 'จำนวน: 2 แก้ว (แก้วละ ฿55.00)', price: 110.0 },
    ],
  },
  {
    id: `#INV-${TODAY.replace(/-/g, '')}-005`,
    type: 'ทานที่ร้าน (โต๊ะ 1)',
    typeClass: 'dine-in',
    cashier: 'Sarah',
    payment: 'cash',
    paymentLabel: 'เงินสด (Cash)',
    timestamp: `${TODAY}T13:35`,
    datetime: `${formattedDate} 13:35 น.`,
    txnId: `TXN-${TODAY.replace(/-/g, '')}-884742`,
    payTime: '13:35:08 น.',
    total: 150.0,
    items: [
      { name: '1. ชาเขียวมัทฉะ (Iced Matcha)', detail: 'หวาน 50%, ฟองนม', meta: 'จำนวน: 2 แก้ว (แก้วละ ฿75.00)', price: 150.0 },
    ],
  },
];

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

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const calcVat = (total) => (total * 7) / 107;
const calcBeforeVat = (total) => total - calcVat(total);

const summarize = (items) => items.map((it) => it.name.replace(/^\d+\.\s*/, '').replace(/\s*\(.*\)\s*$/, '')).join(', ');

const parseQty = (meta = '') => parseInt((meta.match(/จำนวน:?\s*(\d+)/) || [])[1], 10) || 1;
const cleanName = (name) => name.replace(/^\d+\.\s*/, '');
const noteFromMeta = (meta = '') => meta.split('•').map((t) => t.trim()).filter((t) => t && !t.startsWith('จำนวน')).join(' • ');

const billToReceipt = (bill) => {
  const cart = bill.items.map((it) => {
    const qty = parseQty(it.meta);
    return { name: cleanName(it.name), qty, price: it.price / qty, detail: it.detail };
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
export default function BillManagementView({ initialBillId = null }) {
  const [selectedId, setSelectedId] = useState(initialBillId);
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
        const haystack = [bill.id, bill.cashier, bill.txnId, summarize(bill.items)].join(' ').toLowerCase();
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

  const activeBill = visibleBills.find((b) => b.id === selectedId) || null;
  const dateTitle = DATE_TABS.find((t) => t.key === dateTab)?.title || '';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    <div className={`bm-container ${activeBill ? 'has-receipt' : ''}`}>
      <section className="bm-list-pane">
        <header className="bm-list-header">
          <div>
            <h2 className="bm-title">รายการบิลทั้งหมด <span>(Bill Management)</span></h2>
            <p className="bm-subtitle">ตรวจสอบประวัติการขาย ดูรายละเอียด และพิมพ์ใบเสร็จซ้ำ</p>
          </div>

          <div className="bm-header-right">
            <label className="bm-search">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาเลขที่บิล หรือชื่อพนักงาน..." autoComplete="off" />
            </label>
          </div>
        </header>

        <div className="bm-toolbar">
          <div className="bm-tabs" role="tablist">
            {DATE_TABS.map((tab) => (
              <button key={tab.key} type="button" role="tab" aria-selected={dateTab === tab.key} className={`bm-tab ${dateTab === tab.key ? 'active' : ''}`} onClick={() => setDateTab(tab.key)}>{tab.label}</button>
            ))}
          </div>

          <div className="bm-toolbar-right">
            <label className="bm-select-wrap">
              <span>ช่องทางชำระ:</span>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                {PAYMENT_FILTERS.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
              </select>
            </label>

            <label className="bm-select-wrap bm-select-wrap--sort">
              <span>เรียงตาม:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {dateTab === 'custom' && (
          <div className="bm-custom-range">
            <label>ตั้งแต่<input type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} /></label>
            <label>ถึง<input type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} /></label>
          </div>
        )}

        <div className="bm-table-card">
          <table className="bm-table">
            <thead>
              <tr>
                <th className="col-index">#</th>
                <th>เลขที่บิล</th>
                <th>วันที่ / เวลา</th>
                <th>แคชเชียร์</th>
                <th>ช่องทางชำระ</th>
                <th className="col-items">รายการย่อ</th>
                <th className="col-amount">ยอดสุทธิ</th>
              </tr>
            </thead>
            <tbody>
              {visibleBills.map((bill, index) => {
                const isActive = activeBill && activeBill.id === bill.id;
                return (
                  <tr key={bill.id} className={isActive ? 'selected' : ''} tabIndex={0} onClick={() => setSelectedId(bill.id)}>
                    <td className="col-index"><span className="bm-card-index">{index + 1}</span></td>
                    <td>
                      {/* 👉 ลบ span แสดงประเภท/โต๊ะออกตรงนี้ครับ */}
                      <div className="bm-cell-id" style={{ marginBottom: 0 }}>{bill.id}</div>
                    </td>
                    <td className="bm-cell-date">{bill.datetime}</td>
                    <td className="bm-cell-strong">{bill.cashier}</td>
                    <td><span className="bm-method">{bill.paymentLabel}</span></td>
                    <td className="col-items"><div className="bm-cell-items">{summarize(bill.items)}</div></td>
                    <td className="col-amount bm-cell-amount">฿{fmt(bill.total)}</td>
                  </tr>
                );
              })}
              {visibleBills.length === 0 && <tr className="bm-empty-row"><td colSpan="7">ไม่พบบิลที่ตรงกับเงื่อนไขที่เลือก</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bm-table-foot">
          ทั้งหมด {visibleBills.length} บิล ({dateTitle}) · ยอดรวม ฿{fmt(visibleBills.reduce((s, b) => s + b.total, 0))}
        </div>
      </section>

      {activeBill && (
        <aside className="bm-receipt-pane">
          <div className="bm-receipt-scroll">
            <div className="bm-receipt-shop">
              
              <span>{activeBill.datetime.replace(' น.', '')}</span>
              <button type="button" className="bm-close" onClick={() => setSelectedId(null)} aria-label="ปิดใบเสร็จ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="bm-receipt-head">
              <div className="bm-receipt-head-left">
                <h3 className="bm-receipt-title">รายละเอียดใบเสร็จฉบับเต็ม</h3>
                <p className="bm-receipt-sub">{activeBill.type} • แคชเชียร์ {activeBill.cashier} (กะ #04) • Terminal 01</p>
              </div>
              <div className="bm-receipt-head-right">
                <span className="bm-receipt-id">{activeBill.id}</span>
              </div>
            </div>

            <div className="bm-items">
              {activeBill.items.map((item, idx) => {
                const qty = parseQty(item.meta);
                const detail = (item.detail || '').split(',').map((t) => t.trim()).filter(Boolean).join(' • ');
                const note = noteFromMeta(item.meta);
                return (
                  <div className="bm-item" key={idx}>
                    <div className="bm-item-qty">{qty}x</div>
                    <div className="bm-item-body">
                      <div className="bm-item-row"><span className="bm-item-name">{cleanName(item.name)}</span><span className="bm-item-price">฿{fmt(item.price)}</span></div>
                      {detail && <div className="bm-item-detail">{detail}</div>}
                      {note && <div className="bm-item-note">{note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bm-summary">
              <div className="bm-row">
                <span>ราคาสินค้า (รวม VAT)</span>
                <span>฿{fmt(activeBill.total)}</span>
              </div>
              <div className="bm-row">
                <span>มูลค่าสินค้าก่อน VAT</span>
                <span>฿{fmt(calcBeforeVat(activeBill.total))}</span>
              </div>
              <div className="bm-row">
                <span>ภาษีมูลค่าเพิ่ม VAT 7%</span>
                <span>฿{fmt(calcVat(activeBill.total))}</span>
              </div>
              <div className="bm-row bm-row--total">
                <span>ยอดสุทธิ (Total Paid)</span>
                <span className="bm-total-value">฿{fmt(activeBill.total)}</span>
              </div>
            </div>

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
                <span className="bm-payment-label">รหัสธุรกรรม:</span>
                <span className="bm-payment-value bm-mono">{activeBill.txnId}</span>
              </div>
              <div className="bm-payment-row">
                <span className="bm-payment-label">เวลาชำระ:</span>
                <span className="bm-payment-value bm-mono">{activeBill.payTime}</span>
              </div>
            </div>
          </div>

          <div className="bm-receipt-footer">
            <button type="button" className="bm-reprint" onClick={handleReprint}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6" /><path d="M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2" /><path d="M6 14h12v7H6z" /></svg>
              พิมพ์ใบเสร็จซ้ำ
            </button>
          </div>

          {toast && <div className="bm-toast" role="status">{toast}</div>}
        </aside>
      )}
      {!activeBill && toast && <div className="bm-toast bm-toast--fixed" role="status">{toast}</div>}
    </div>
  );
}