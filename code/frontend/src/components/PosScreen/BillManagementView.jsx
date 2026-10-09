import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './BillManagementView.css';
import { printReceipt } from './Receiptprinter';
import { listOrders, getOrder } from '../../api/orders';
import { getPayment } from '../../api/payment';

/* ---------------------------------------------------------
   ตั้งค่าวันที่ปัจจุบัน
--------------------------------------------------------- */
const todayObj = new Date();
const yyyy = todayObj.getFullYear();
const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
const dd = String(todayObj.getDate()).padStart(2, '0');
const TODAY = `${yyyy}-${mm}-${dd}`;
const formattedDate = `${dd}/${mm}/${yyyy}`;


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
// Map backend OrderSummaryResponse → the bill shape the view already uses.
const summaryToBill = (row, paymentMethod) => {
  const method = paymentMethod === 'QR_CODE' ? 'promptpay' : paymentMethod === 'CARD' ? 'card' : 'cash';
  const methodLabel = method === 'promptpay' ? 'PromptPay QR' : method === 'card' ? 'บัตรเครดิต (Card)' : 'เงินสด (Cash)';
  const date = row.createdAt ? new Date(row.createdAt) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return {
    id: row.orderNumber || `#${row.id}`,
    orderId: row.id,
    type: `${row.itemCount || 0} รายการ`,
    typeClass: 'dine-in',
    cashier: row.cashierName || 'Cashier',
    payment: method,
    paymentLabel: methodLabel,
    timestamp: (row.createdAt || date.toISOString()).slice(0, 16),
    datetime: `${dateStr} ${timeStr} น.`,
    txnId: `TXN-${row.id}`,
    payTime: `${timeStr}:00 น.`,
    total: Number(row.total || 0),
    itemCount: row.itemCount || 0,
    items: [{ name: `${row.itemCount || 0} รายการ`, detail: '', meta: '', price: Number(row.total || 0) }],
  };
};

const orderToItems = (order) =>
  (order?.items || []).map((it, i) => {
    const addOns = (it.addOns || []).map((a) => `${a.name} (+฿${Number(a.price).toFixed(2)})`).join(', ');
    return {
      name: `${i + 1}. ${it.productName}`,
      detail: addOns,
      meta: `จำนวน ${it.quantity} • ราคา/หน่วย ฿${Number(it.unitPrice).toFixed(2)}`,
      price: Number(it.lineTotal ?? it.unitPrice * it.quantity),
    };
  });

export default function BillManagementView({ initialBillId = null }) {
  const [selectedId, setSelectedId] = useState(initialBillId);
  const [dateTab, setDateTab] = useState('today');
  const [customFrom, setCustomFrom] = useState(TODAY);
  const [customTo, setCustomTo] = useState(TODAY);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [toast, setToast] = useState('');
  const [bills, setBills] = useState([]);
  const [activeDetail, setActiveDetail] = useState(null);

  // Compute the API date range from the current tab.
  const [fromDate, toDate] = useMemo(() => {
    const now = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    if (dateTab === 'today') return [iso(now), iso(now)];
    if (dateTab === 'week') {
      const s = new Date(now); s.setDate(now.getDate() - 6); return [iso(s), iso(now)];
    }
    if (dateTab === 'month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1); return [iso(s), iso(now)];
    }
    return [customFrom, customTo];
  }, [dateTab, customFrom, customTo]);

  const loadBills = useCallback(async () => {
    try {
      const page = await listOrders({ status: 'PAID', from: fromDate, to: toDate, size: 200, sort: 'createdAt,desc' });
      const rows = page?.content ?? [];
      const payments = await Promise.all(rows.map((r) => getPayment(r.id).catch(() => null)));
      setBills(rows.map((r, i) => summaryToBill(r, payments[i]?.method)));
    } catch (err) {
      console.error('listOrders failed:', err);
      setBills([]);
    }
  }, [fromDate, toDate]);

  useEffect(() => { loadBills(); }, [loadBills]);

  // Lazy-load the full OrderResponse so the receipt pane shows real items.
  useEffect(() => {
    const bill = bills.find((b) => b.id === selectedId);
    if (!bill) { setActiveDetail(null); return; }
    let cancelled = false;
    getOrder(bill.orderId).then((d) => { if (!cancelled) setActiveDetail(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, [selectedId, bills]);

  const visibleBills = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = bills.filter((bill) => {
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
    // If the full order detail is loaded, print with real items (name/qty/unitPrice/add-ons);
    // otherwise fall back to the summary-only cart from billToReceipt.
    const cart = activeDetail?.items
      ? activeDetail.items.map((it) => ({
          name: it.productName,
          qty: it.quantity,
          price: Number(it.unitPrice),
          detail: (it.addOns || []).map((a) => a.name).join(', '),
        }))
      : billToReceipt(activeBill).cart;
    const payload = { ...billToReceipt(activeBill), cart };
    const opened = printReceipt(payload);
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
              {/* Prefer backend-authoritative items from activeDetail (real qty + unitPrice + add-on names) when loaded. */}
              {(activeDetail ? orderToItems(activeDetail) : activeBill.items).map((item, idx) => {
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