import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { salesSummary, topProducts, salesByCashier, salesByPaymentMethod } from '../../api/reports';

const DATE_TABS = [
  { key: 'today', label: 'วันนี้' },
  { key: 'week', label: 'สัปดาห์นี้' },
  { key: 'month', label: 'เดือนนี้' },
];

const METHOD_LABEL = { CASH: 'เงินสด', QR_CODE: 'PromptPay QR', CARD: 'บัตรเครดิต' };

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isoDate = (d) => d.toISOString().slice(0, 10);

function computeRange(tab) {
  const now = new Date();
  if (tab === 'today') return [isoDate(now), isoDate(now)];
  if (tab === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return [isoDate(start), isoDate(now)];
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return [isoDate(start), isoDate(now)];
}

export default function DashboardView() {
  const [dateTab, setDateTab] = useState('today');
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [from, to] = useMemo(() => computeRange(dateTab), [dateTab]);

  const loadAll = useCallback(async () => {
    setBusy(true);
    try {
      const [s, p, c, m] = await Promise.all([
        salesSummary(from, to),
        topProducts(from, to, 10),
        salesByCashier(from, to).catch(() => []),
        salesByPaymentMethod(from, to),
      ]);
      setSummary(s);
      setProducts(p || []);
      setCashiers(c || []);
      setMethods(m || []);
      setLoadError(null);
    } catch (err) {
      console.error('reports failed:', err);
      setLoadError(err?.message ?? 'โหลดข้อมูลรายงานไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }, [from, to]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const cardStyle = { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', flex: 1 };
  const cellStyle = { padding: '12px 14px', fontSize: 13, textAlign: 'left', borderBottom: '1px solid #f3f4f6' };
  const headStyle = { ...cellStyle, fontWeight: 700, color: '#4b5563', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' };

  return (
    <div style={{ padding: '24px', flex: 1, overflow: 'auto', fontFamily: 'Prompt, sans-serif', color: '#111827' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px 0' }}>Dashboard <span style={{ color: '#6b7280', fontWeight: 500, fontSize: 16 }}>(รายงานยอดขาย)</span></h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>ยอดขายรวม, สินค้าขายดี, ยอดตามพนักงาน และยอดตามช่องทางชำระเงิน</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DATE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDateTab(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: '1px solid #e5e7eb', cursor: 'pointer',
                background: dateTab === tab.key ? '#111827' : '#fff',
                color: dateTab === tab.key ? '#fff' : '#4b5563',
                fontSize: 13, fontWeight: 600,
              }}>
              {tab.label}
            </button>
          ))}
          <button onClick={loadAll} disabled={busy} style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {busy ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
        </div>
      </header>

      {loadError && <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16 }}>เกิดข้อผิดพลาด: {loadError}</div>}

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>ยอดขายรวม (Gross Sales)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>฿{fmt(summary?.grossSales)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>ส่วนลดรวม (Total Discount)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ea580c' }}>-฿{fmt(summary?.totalDiscount)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>ยอดขายสุทธิ (Net Sales)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>฿{fmt(summary?.netSales)}</div>
        </div>
      </div>

      {/* Two-column: top products + cashiers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15 }}>
            🏆 สินค้าขายดี (Top 10)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={headStyle}>#</th>
                <th style={headStyle}>สินค้า</th>
                <th style={{ ...headStyle, textAlign: 'right' }}>จำนวน</th>
                <th style={{ ...headStyle, textAlign: 'right' }}>ยอดขาย</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="4" style={{ ...cellStyle, textAlign: 'center', color: '#9ca3af' }}>ไม่มีข้อมูล</td></tr>
              ) : products.map((p, i) => (
                <tr key={p.productId}>
                  <td style={cellStyle}>{i + 1}</td>
                  <td style={cellStyle}>{p.productName}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{p.quantitySold}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 700, color: '#059669' }}>฿{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15 }}>
            👤 ยอดขายตามพนักงาน (Sales by Cashier)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={headStyle}>พนักงาน</th>
                <th style={{ ...headStyle, textAlign: 'right' }}>ออเดอร์</th>
                <th style={{ ...headStyle, textAlign: 'right' }}>ยอดสุทธิ</th>
              </tr>
            </thead>
            <tbody>
              {cashiers.length === 0 ? (
                <tr><td colSpan="3" style={{ ...cellStyle, textAlign: 'center', color: '#9ca3af' }}>ไม่มีข้อมูล (ต้องเป็น ADMIN ถึงจะเห็น)</td></tr>
              ) : cashiers.map((c) => (
                <tr key={c.cashierId}>
                  <td style={cellStyle}>{c.cashierName}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{c.orderCount}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 700, color: '#059669' }}>฿{fmt(c.netSales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment method table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15 }}>
          💳 ยอดขายตามช่องทางชำระเงิน (Sales by Payment Method)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headStyle}>ช่องทาง</th>
              <th style={{ ...headStyle, textAlign: 'right' }}>ออเดอร์</th>
              <th style={{ ...headStyle, textAlign: 'right' }}>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {methods.length === 0 ? (
              <tr><td colSpan="3" style={{ ...cellStyle, textAlign: 'center', color: '#9ca3af' }}>ไม่มีข้อมูล</td></tr>
            ) : methods.map((m) => (
              <tr key={m.method}>
                <td style={cellStyle}>{METHOD_LABEL[m.method] || m.method}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>{m.orderCount}</td>
                <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 700, color: '#059669' }}>฿{fmt(m.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
