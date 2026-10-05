import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './BillManagementView.css';
import { listOrders, getOrder } from '../../api/orders';
import { getPayment } from '../../api/payment';
import { printReceipt } from './Receiptprinter';

/* ---------------------------------------------------------
   Backend contract:
   - listOrders({ status:'PAID', from, to, page, size, sort }) → PageResponse<OrderSummaryResponse>
     OrderSummaryResponse: { id, orderNumber, status, cashierName, itemCount, total, createdAt }
   - getOrder(id) → OrderResponse with items[], discount fields, payment
   - getPayment(orderId) → PaymentResponse { id, orderId, method, amountReceived, change, paidAt }
--------------------------------------------------------- */

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
const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const calcVat = (total) => (total * 7) / 107;

const summarize = (items) =>
  items
    .map((it) => {
      const name = it.name.replace(/^\d+\.\s*/, '').replace(/\s*\(.*\)\s*$/, '');
      return name;
    })
    .join(', ');

const todayIso = () => new Date().toISOString().slice(0, 10);

const isoDate = (instantOrDate) => {
  if (!instantOrDate) return '';
  return new Date(instantOrDate).toISOString().slice(0, 10);
};

const formatDateThai = (instantOrDate) => {
  if (!instantOrDate) return '';
  const d = new Date(instantOrDate);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi} น.`;
};

const formatTimeThai = (instantOrDate) => {
  if (!instantOrDate) return '';
  const d = new Date(instantOrDate);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mi}:${ss} น.`;
};

/** Maps backend enum PaymentMethod → PaymentModal-style key + Thai label. */
const paymentMeta = (backendMethod) => {
  if (backendMethod === 'QR_CODE') return { key: 'promptpay', label: 'PromptPay QR' };
  if (backendMethod === 'CARD') return { key: 'card', label: 'บัตรเครดิต (Card)' };
  return { key: 'cash', label: 'เงินสด (Cash)' };
};

/** Backend list rows don't include payment info; fetch summary + guess method from a follow-up. */
const summaryToBill = (row, paymentByOrderId = {}) => {
  const meta = paymentMeta(paymentByOrderId[row.id]?.method);
  return {
    id: row.orderNumber || `#${row.id}`,
    orderId: row.id,
    type: 'ทานที่ร้าน',
    typeClass: 'dine-in',
    cashier: row.cashierName || 'Cashier',
    payment: meta.key,
    paymentLabel: meta.label,
    timestamp: (row.createdAt || '').slice(0, 16),
    datetime: formatDateThai(row.createdAt),
    txnId: paymentByOrderId[row.id]?.id ? `TXN-${paymentByOrderId[row.id].id}` : `TXN-${row.id}`,
    payTime: paymentByOrderId[row.id]?.paidAt ? formatTimeThai(paymentByOrderId[row.id].paidAt) : formatTimeThai(row.createdAt),
    total: Number(row.total || 0),
    itemCount: row.itemCount || 0,
    items: [
      // Placeholder — backend list doesn't include items. Full detail loads on select.
      { name: `${row.itemCount || 0} รายการ`, detail: 'เลือกดูรายละเอียด...', meta: '', price: Number(row.total || 0) },
    ],
  };
};

const orderToBillItems = (order) =>
  (order?.items || []).map((it, i) => {
    const addOns = (it.addOns || []).map((a) => `${a.name} (+฿${Number(a.price).toFixed(2)})`).join(', ');
    return {
      name: `${i + 1}. ${it.productName}`,
      detail: addOns || '',
      meta: `จำนวน ${it.quantity}${addOns ? '' : ''} • ราคา/หน่วย ฿${Number(it.unitPrice).toFixed(2)}`,
      price: Number(it.lineTotal ?? (it.unitPrice * it.quantity)),
    };
  });

/* ---------------------------------------------------------
   Component
--------------------------------------------------------- */
export default function BillManagementView() {
  const [bills, setBills] = useState([]);
  const [activeDetail, setActiveDetail] = useState(null); // full OrderResponse for selected bill
  const [selectedId, setSelectedId] = useState(null);
  const [dateTab, setDateTab] = useState('today');
  const [customFrom, setCustomFrom] = useState(todayIso());
  const [customTo, setCustomTo] = useState(todayIso());
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [toast, setToast] = useState('');
  const [loadError, setLoadError] = useState(null);

  // Compute date range for API call from tab selection
  const [fromDate, toDate] = useMemo(() => {
    const now = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    if (dateTab === 'today') return [iso(now), iso(now)];
    if (dateTab === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return [iso(start), iso(now)];
    }
    if (dateTab === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return [iso(start), iso(now)];
    }
    return [customFrom, customTo];
  }, [dateTab, customFrom, customTo]);

  const loadBills = useCallback(async () => {
    try {
      const page = await listOrders({ status: 'PAID', from: fromDate, to: toDate, size: 200, sort: 'createdAt,desc' });
      const rows = page?.content ?? [];
      // Kick off payment fetches in parallel so we know each bill's method for the pill/filter.
      const payments = await Promise.all(rows.map((r) => getPayment(r.id).catch(() => null)));
      const paymentByOrderId = Object.fromEntries(rows.map((r, i) => [r.id, payments[i]]));
      setBills(rows.map((r) => summaryToBill(r, paymentByOrderId)));
      setLoadError(null);
    } catch (err) {
      console.error('listOrders failed:', err);
      setLoadError(err?.message ?? 'โหลดรายการบิลไม่สำเร็จ');
      setBills([]);
    }
  }, [fromDate, toDate]);

  useEffect(() => { loadBills(); }, [loadBills]);

  // When user picks a bill, hydrate items from getOrder so the receipt pane shows real content.
  useEffect(() => {
    const bill = bills.find((b) => b.id === selectedId);
    if (!bill) { setActiveDetail(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const detail = await getOrder(bill.orderId);
        if (!cancelled) setActiveDetail(detail);
      } catch (err) {
        console.error('getOrder failed:', err);
        if (!cancelled) setActiveDetail(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, bills]);

  const visibleBills = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = bills.filter((bill) => {
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
  }, [bills, search, paymentFilter, sortBy]);

  // Auto-select first visible bill when list changes
  useEffect(() => {
    if (visibleBills.length > 0 && !visibleBills.find((b) => b.id === selectedId)) {
      setSelectedId(visibleBills[0].id);
    } else if (visibleBills.length === 0) {
      setSelectedId(null);
    }
  }, [visibleBills, selectedId]);

  const activeBill = visibleBills.find((b) => b.id === selectedId) || visibleBills[0] || null;
  const dateTitle = DATE_TABS.find((t) => t.key === dateTab)?.title || 'ช่วงกำหนดเอง';

  // Use backend order detail for items/subtotal/discount; fall back to bill summary if not loaded yet.
  const displayItems = activeDetail ? orderToBillItems(activeDetail) : (activeBill?.items || []);
  const displaySubtotal = activeDetail ? Number(activeDetail.subtotal) : (activeBill?.total || 0);
  const displayDiscount = activeDetail ? Number(activeDetail.discountAmount || 0) : 0;
  const displayTotal = activeDetail ? Number(activeDetail.total) : (activeBill?.total || 0);

  const handleReprint = () => {
    if (!activeBill) return;
    // Prefer backend-authoritative items from activeDetail; fall back to summary cart if detail not yet loaded.
    const cart = activeDetail?.items
      ? activeDetail.items.map((it) => ({
          name: it.productName,
          qty: it.quantity,
          price: Number(it.unitPrice),
          detail: (it.addOns || []).map((a) => a.name).join(', '),
        }))
      : (activeBill.items || []).map((it) => ({ name: it.name, qty: 1, price: it.price, detail: it.detail }));

    const opened = printReceipt({
      totalAmount: displayTotal,
      method: activeBill.payment,
      cart,
      orderId: activeBill.id,
      receiptNo: activeBill.id.replace('#', ''),
      queueNo: `Q${activeBill.orderId}`,
      cashierName: activeBill.cashier,
      date: new Date(activeBill.timestamp),
      isReprint: true,
    });
    setToast(opened
      ? `กำลังพิมพ์ใบเสร็จ ${activeBill.id}`
      : 'บราวเซอร์บล็อก Pop-up อยู่ กรุณาอนุญาตเพื่อเปิดใบเสร็จ');
    window.setTimeout(() => setToast(''), 2500);
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
            <button type="button" className="bm-btn bm-btn--tool" onClick={loadBills}>
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

        {loadError && <div className="bm-empty" style={{ color: '#dc2626' }}>เกิดข้อผิดพลาด: {loadError}</div>}

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
                  <span className="bm-card-items">รายการย่อ: {bill.itemCount} รายการ</span>
                  <span className={`bm-card-hint ${isActive ? 'active' : ''}`}>
                    {isActive ? 'ดูข้อมูลล่าสุด' : 'เสร็จสิ้น'}
                  </span>
                </div>
              </article>
            );
          })}

          {visibleBills.length === 0 && !loadError && (
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
                    {activeBill.type} • แคชเชียร์ {activeBill.cashier} • Terminal 01
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
                {displayItems.map((item, idx) => (
                  <div className="bm-item" key={idx}>
                    <div className="bm-item-body">
                      <div className="bm-item-row">
                        <span className="bm-item-name">{item.name}</span>
                        <span className="bm-item-price">฿{fmt(item.price)}</span>
                      </div>
                      {item.detail && <div className="bm-item-detail">{item.detail}</div>}
                      {item.meta && <div className="bm-item-meta">{item.meta}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* สรุปยอด */}
              <div className="bm-summary">
                <div className="bm-row">
                  <span>รวมมูลค่าสินค้า (Subtotal)</span>
                  <span>฿{fmt(displaySubtotal)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="bm-row">
                    <span>ส่วนลด (Discount)</span>
                    <span>-฿{fmt(displayDiscount)}</span>
                  </div>
                )}
                <div className="bm-row">
                  <span>ภาษีมูลค่าเพิ่ม VAT 7% (รวมในราคา)</span>
                  <span>฿{fmt(calcVat(displayTotal))}</span>
                </div>
                <div className="bm-row bm-row--total">
                  <span>ยอดสุทธิ (Total Paid)</span>
                  <span className="bm-total-value">฿{fmt(displayTotal)}</span>
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
                  <span className="bm-payment-label">รหัสธุรกรรม / เวลา:</span>
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
