import React, { useEffect, useMemo, useState } from "react";
import "./DashboardView.css";
import { listOrders } from "../../api/orders";
import { quickStatsToday } from "../../api/orders";
import {
  salesSummary,
  topProducts,
  salesByCashier,
  salesByPaymentMethod,
  salesByDay,
  salesByCategory,
} from "../../api/reports";

/* =========================================================
   ข้อมูลตัวอย่าง (Mock) — แทนที่ด้วยข้อมูลจาก API ภายหลัง
   โครงสร้างด้านล่างตั้งใจให้ใกล้เคียงกับสิ่งที่ Backend จะส่งมา
========================================================= */
const TODAY_ISO = "2026-09-28";

// สรุปประจำวัน (ยอดขายสุทธิหลังหักส่วนลดแล้ว)
const TODAY = { revenue: 12480, discount: 640, orders: 52, cancelled: 2, cash: 4368, promptpay: 8112 };
const YESTERDAY = { revenue: 11100, orders: 48 };

// ยอดขายรายชั่วโมง 08:00 – 18:00 (รวมกันเท่ากับยอดขายรวมของวัน)
const HOURLY = [
  380, 900, 1380, 1700, 1450, 1100, 1350, 1560, 1260, 900, 500,
].map((value, i) => ({ label: `${String(8 + i).padStart(2, "0")}:00`, value }));

// ยอดขาย 7 วันล่าสุด (เรียงจากเก่า -> วันนี้) และ 6 เดือนล่าสุด
const WEEK_VALUES = [9850, 10420, 9210, 11300, 14850, 11100, 12480];
const MONTHS = [
  { label: "เม.ย.", value: 268400 },
  { label: "พ.ค.", value: 291200 },
  { label: "มิ.ย.", value: 305800 },
  { label: "ก.ค.", value: 322600 },
  { label: "ส.ค.", value: 298400 },
  { label: "ก.ย.", value: 341900 },
];

const TOP_DRINKS = [
  { name: "ICED AMERICANO", qty: 64, revenue: 3520 },
  { name: "ชาเขียวมัทฉะ", qty: 52, revenue: 3900 },
  { name: "คาปูชิโน่เย็น", qty: 47, revenue: 4465 },
  { name: "ชาไทยพรีเมียม", qty: 41, revenue: 2665 },
  { name: "ESPRESSO SHOT", qty: 38, revenue: 2090 },
];

const TOP_ADDONS = [
  { name: "เพิ่มช็อตกาแฟ", desc: "+Extra Shot", qty: 38, price: 20 },
  { name: "ไข่มุก", desc: "+Tapioca Pearls", qty: 31, price: 10 },
  { name: "วิปครีม", desc: "+Whipped Cream", qty: 27, price: 15 },
  { name: "นมโอ๊ต", desc: "+Oat Milk", qty: 22, price: 15 },
  { name: "บุกบราวน์ชูการ์", desc: "+Brown Sugar Jelly", qty: 19, price: 15 },
];

const SWEETNESS = [
  { label: "100%", pct: 22 },
  { label: "75%", pct: 18 },
  { label: "50%", pct: 38 },
  { label: "25%", pct: 14 },
  { label: "0%", pct: 8 },
];

const STATUS_META = {
  completed: { label: "ชำระแล้ว", cls: "up" },
  cancelled: { label: "ยกเลิก", cls: "down" },
};

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const fmt = (n, d = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const baht = (n, d = 2) => `฿${fmt(n, d)}`;
const compact = (n) => (n >= 100000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const growth = (cur, prev) => ((cur - prev) / prev) * 100;

const summarize = (items) =>
  items.map((it) => it.name.replace(/^\d+\.\s*/, "").replace(/\s*\(.*\)\s*$/, "")).join(", ");

const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const weekData = (WEEK_VALUES = [9850, 10420, 9210, 11300, 14850, 11100, 12480]) => {
  const end = new Date(`${TODAY_ISO}T00:00:00`);
  return WEEK_VALUES.map((value, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (WEEK_VALUES.length - 1 - i));
    return { label: `${THAI_DAYS[d.getDay()]} ${d.getDate()}`, value, highlight: i === WEEK_VALUES.length - 1 };
  });
};
const monthData = () => MONTHS.map((m, i) => ({ ...m, highlight: i === MONTHS.length - 1 }));

/* ---------------------------------------------------------
   Small components
--------------------------------------------------------- */
function Growth({ value, suffix = "" }) {
  const up = value >= 0;
  return (
    <span className={`db-badge ${up ? "db-badge--up" : "db-badge--down"}`}>
      {up ? "▲" : "▼"} {up ? "+" : ""}{value.toFixed(1)}%{suffix}
    </span>
  );
}

const Svg = (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p} />;
const WalletIcon = () => <Svg><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4" /><path d="M21 9H7a2 2 0 0 0 0 4h14z" /></Svg>;
const ReceiptIcon = () => <Svg><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></Svg>;
const TicketIcon = () => <Svg><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 0 0-6V6H3z" /><path d="M13 6v12" strokeDasharray="2 3" /></Svg>;
const CardIcon = () => <Svg><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19" /></Svg>;

/* ---------- Line chart: ยอดขายรายชั่วโมง ---------- */
function LineChart({ data, yStep = 500 }) {
  const W = 640, H = 270, L = 52, R = 18, T = 24, B = 34;
  const [hover, setHover] = useState(null);

  const max = Math.max(...data.map((d) => d.value));
  const yMax = Math.ceil(max / yStep) * yStep;
  const peak = data.findIndex((d) => d.value === max);
  const active = hover ?? peak;

  const x = (i) => L + (i * (W - L - R)) / (data.length - 1);
  const y = (v) => T + (1 - v / yMax) * (H - T - B);
  const step = (W - L - R) / (data.length - 1);

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - B} L${x(0)},${H - B} Z`;
  const ticks = [];
  for (let v = 0; v <= yMax; v += yStep) ticks.push(v);

  const tipW = 112, tipH = 46;
  const tipX = Math.min(Math.max(x(active) - tipW / 2, L), W - R - tipW);
  const tipY = Math.max(y(data[active].value) - tipH - 12, 2);

  return (
    <svg className="db-chart-svg" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)} role="img" aria-label="กราฟยอดขายรายชั่วโมง">
      <defs>
        <linearGradient id="dbArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--db-brand)", stopOpacity: 0.18 }} />
          <stop offset="100%" style={{ stopColor: "var(--db-brand)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {ticks.map((v) => (
        <g key={v}>
          <line className="db-grid-line" x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
          <text className="db-axis-text" x={L - 10} y={y(v) + 4} textAnchor="end">{v === 0 ? "0" : compact(v)}</text>
        </g>
      ))}

      <path d={area} fill="url(#dbArea)" />
      <path className="db-line" d={line} />
      <line className="db-hover-line" x1={x(active)} x2={x(active)} y1={T} y2={H - B} />

      {data.map((d, i) => (
        <g key={d.label}>
          <circle className={`db-dot ${i === active ? "db-dot--active" : ""}`} cx={x(i)} cy={y(d.value)} r={i === active ? 6 : 4} />
          <text className="db-axis-text" x={x(i)} y={H - 10} textAnchor="middle">{d.label.slice(0, 2)}</text>
          <rect x={x(i) - step / 2} y={0} width={step} height={H - B} fill="transparent" onMouseEnter={() => setHover(i)} />
        </g>
      ))}

      <g pointerEvents="none">
        <rect className="db-tip-box" x={tipX} y={tipY} width={tipW} height={tipH} rx="8" />
        <text className="db-tip-sub" x={tipX + 12} y={tipY + 18}>{data[active].label} น.</text>
        <text className="db-tip-text" x={tipX + 12} y={tipY + 36}>{baht(data[active].value, 0)}</text>
      </g>
    </svg>
  );
}

/* ---------- Bar chart: เปรียบเทียบย้อนหลัง ---------- */
function BarChart({ data }) {
  const W = 420, H = 270, L = 8, R = 8, T = 30, B = 34;
  const max = Math.max(...data.map((d) => d.value));
  const yMax = max * 1.1;
  const slot = (W - L - R) / data.length;
  const bw = Math.min(38, slot * 0.58);
  const h = (v) => (v / yMax) * (H - T - B);

  return (
    <svg className="db-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="กราฟแท่งเปรียบเทียบยอดขาย">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} className="db-grid-line" x1={L} x2={W - R} y1={H - B - (H - T - B) * f} y2={H - B - (H - T - B) * f} />
      ))}
      <line className="db-grid-line" x1={L} x2={W - R} y1={H - B} y2={H - B} />

      {data.map((d, i) => {
        const bx = L + slot * i + (slot - bw) / 2;
        const by = H - B - h(d.value);
        return (
          <g key={d.label} className="db-bar-hit">
            <title>{`${d.label}: ${baht(d.value, 0)}`}</title>
            <rect className={`db-bar ${d.highlight ? "db-bar--hl" : ""}`} x={bx} y={by} width={bw} height={h(d.value)} rx="6" />
            <text className="db-bar-val" x={bx + bw / 2} y={by - 7}>{compact(d.value)}</text>
            <text className="db-axis-text" x={bx + bw / 2} y={H - 12} textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------
   Main
--------------------------------------------------------- */
/**
 * props:
 *  - onViewBill(billId?)  เปิดหน้า Bill Management (ถ้าส่ง billId จะเปิดใบเสร็จของบิลนั้นเลย)
 */
export default function DashboardView({ onViewBill }) {
  const [compare, setCompare] = useState("week"); // 'week' | 'month'

  // Backend-loaded overlays — fall back to mock constants if the API is unavailable so the
  // dashboard still renders something during offline / 403 / startup.
  const [today, setToday] = useState(TODAY);
  const [weekValues, setWeekValues] = useState(WEEK_VALUES);
  const [topDrinks, setTopDrinks] = useState(TOP_DRINKS);
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekFromIso = weekStart.toISOString().slice(0, 10);

    quickStatsToday().then((s) => {
      setToday((prev) => ({ ...prev, revenue: Number(s.netSales), orders: s.orderCount }));
    }).catch(() => {});

    salesSummary(todayIso, todayIso).then((s) => {
      setToday((prev) => ({ ...prev, discount: Number(s.totalDiscount || 0) }));
    }).catch(() => {});

    salesByPaymentMethod(todayIso, todayIso).then((rows) => {
      const cash = Number(rows.find((r) => r.method === 'CASH')?.amount || 0);
      const qr = Number(rows.find((r) => r.method === 'QR_CODE')?.amount || 0);
      setToday((prev) => ({ ...prev, cash, promptpay: qr }));
    }).catch(() => {});

    salesByDay(weekFromIso, todayIso).then((days) => {
      if (days && days.length) setWeekValues(days.map((d) => Number(d.netSales)));
    }).catch(() => {});

    topProducts(todayIso, todayIso, 5).then((list) => {
      if (list && list.length) {
        setTopDrinks(list.map((p) => ({ name: p.productName, qty: Number(p.quantitySold), revenue: Number(p.revenue) })));
      }
    }).catch(() => {});

    listOrders({ status: 'PAID', from: todayIso, to: todayIso, size: 5, sort: 'createdAt,desc' })
      .then((page) => {
        const bills = (page?.content || []).map((o) => ({
          id: o.orderNumber,
          total: Number(o.total),
          timestamp: o.createdAt,
          datetime: new Date(o.createdAt).toLocaleString('th-TH'),
          cashier: o.cashierName,
          typeClass: 'dine-in',
          type: `${o.itemCount} รายการ`,
          paymentLabel: '',
          items: [{ name: `${o.itemCount} รายการ` }],
        }));
        if (bills.length) setRecentBills(bills);
      })
      .catch(() => {});
  }, []);

  const avgTicket = today.revenue && today.orders ? today.revenue / today.orders : 0;
  const avgYesterday = YESTERDAY.revenue / YESTERDAY.orders;
  const cashPct = today.revenue > 0 ? (today.cash / today.revenue) * 100 : 0;
  const promptpayPct = 100 - cashPct;

  const peak = HOURLY.reduce((a, b) => (b.value > a.value ? b : a));
  const peakEnd = `${String(parseInt(peak.label, 10) + 1).padStart(2, "0")}:00`;

  const bars = useMemo(() => (compare === "week" ? weekData(weekValues) : monthData()), [compare, weekValues]);
  const weekTotal = weekValues.reduce((s, v) => s + v, 0);
  const monthGrowth = growth(MONTHS[MONTHS.length - 1].value, MONTHS[MONTHS.length - 2].value);

  const maxDrink = Math.max(...topDrinks.map((d) => d.qty));
  const maxAddon = Math.max(...TOP_ADDONS.map((a) => a.qty));
  const topSweet = Math.max(...SWEETNESS.map((s) => s.pct));

  const dateLabel = new Date(`${TODAY_ISO}T00:00:00`).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="db-container">
      {/* ---------- Header ---------- */}
      <header className="db-header">
        <div>
          <h2 className="db-title">แดชบอร์ด <span>(Dashboard)</span></h2>
          <p className="db-subtitle">ภาพรวมยอดขาย สินค้าขายดี และบิลล่าสุดของร้านประจำวัน</p>
        </div>
        <span className="db-date-chip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          ข้อมูลวันที่ {dateLabel}
        </span>
      </header>

      {/* ---------- 1) KPI Cards ---------- */}
      <section className="db-kpis" aria-label="สรุปภาพรวมประจำวัน">
        <article className="db-card db-kpi db-kpi--brand">
          <div className="db-kpi__top">
            <span className="db-kpi__label">ยอดขายรวม (Total Revenue)</span>
            <span className="db-kpi__icon"><WalletIcon /></span>
          </div>
          <div className="db-kpi__value">{baht(today.revenue)}</div>
          <div className="db-kpi__meta">
            <Growth value={growth(today.revenue, YESTERDAY.revenue)} />
            <span>เทียบเมื่อวาน</span>
            <span className="db-badge db-badge--down">ส่วนลด −{baht(today.discount, 0)}</span>
          </div>
        </article>

        <article className="db-card db-kpi">
          <div className="db-kpi__top">
            <span className="db-kpi__label">จำนวนออเดอร์ (Total Orders)</span>
            <span className="db-kpi__icon"><ReceiptIcon /></span>
          </div>
          <div className="db-kpi__value">{today.orders}<small>บิล</small></div>
          <div className="db-kpi__meta">
            <Growth value={growth(today.orders, YESTERDAY.orders)} />
            <span>เทียบเมื่อวาน</span>
            <span className="db-badge db-badge--down">ยกเลิกบิล {today.cancelled}</span>
          </div>
        </article>

        <article className="db-card db-kpi">
          <div className="db-kpi__top">
            <span className="db-kpi__label">เฉลี่ยต่อบิล (Avg. Ticket)</span>
            <span className="db-kpi__icon"><TicketIcon /></span>
          </div>
          <div className="db-kpi__value">{baht(avgTicket)}</div>
          <div className="db-kpi__meta">
            <Growth value={growth(avgTicket, avgYesterday)} />
            <span>ยอดขายรวม ÷ จำนวนออเดอร์</span>
          </div>
        </article>

        <article className="db-card db-kpi">
          <div className="db-kpi__top">
            <span className="db-kpi__label">ช่องทางชำระเงิน (Payment Split)</span>
            <span className="db-kpi__icon"><CardIcon /></span>
          </div>
          <div className="db-split-bar" role="img" aria-label={`เงินสด ${cashPct.toFixed(0)}% PromptPay ${promptpayPct.toFixed(0)}%`}>
            <i style={{ width: `${promptpayPct}%`, background: "var(--db-brand)" }} />
            <i style={{ width: `${cashPct}%`, background: "#f59e0b" }} />
          </div>
          <div className="db-split-legend">
            <div className="db-split-row">
              <span className="db-split-dot" style={{ background: "var(--db-brand)" }} />
              <span className="db-split-name">PromptPay QR</span>
              <span className="db-split-val">{baht(today.promptpay, 0)}</span>
              <span className="db-split-pct">{promptpayPct.toFixed(0)}%</span>
            </div>
            <div className="db-split-row">
              <span className="db-split-dot" style={{ background: "#f59e0b" }} />
              <span className="db-split-name">เงินสด (Cash)</span>
              <span className="db-split-val">{baht(today.cash, 0)}</span>
              <span className="db-split-pct">{cashPct.toFixed(0)}%</span>
            </div>
          </div>
        </article>
      </section>

      {/* ---------- 2) Charts ---------- */}
      <section className="db-charts">
        <article className="db-card">
          <div className="db-card__head">
            <div>
              <h3 className="db-card__title">ยอดขายตามช่วงเวลา (Hourly Sales)</h3>
              <p className="db-card__sub">ยอดขายรายชั่วโมง 08:00 – 18:00 · วางเมาส์บนกราฟเพื่อดูแต่ละช่วง</p>
            </div>
          </div>
          <LineChart data={HOURLY} />
          <div className="db-peak-note">
            ช่วงร้านแน่นที่สุด <strong>{peak.label} – {peakEnd} น.</strong> ยอดขาย {baht(peak.value, 0)}
          </div>
        </article>

        <article className="db-card">
          <div className="db-card__head">
            <div>
              <h3 className="db-card__title">เปรียบเทียบยอดขายย้อนหลัง</h3>
              <p className="db-card__sub">{compare === "week" ? "7 วันล่าสุด" : "6 เดือนล่าสุด"}</p>
            </div>
            <div className="db-pills" role="tablist">
              <button type="button" role="tab" aria-selected={compare === "week"} className={`db-pill ${compare === "week" ? "active" : ""}`} onClick={() => setCompare("week")}>รายสัปดาห์</button>
              <button type="button" role="tab" aria-selected={compare === "month"} className={`db-pill ${compare === "month" ? "active" : ""}`} onClick={() => setCompare("month")}>รายเดือน</button>
            </div>
          </div>
          <BarChart data={bars} />
          <div className="db-peak-note">
            {compare === "week" ? (
              <>รวม 7 วัน <strong>{baht(weekTotal, 0)}</strong> · เฉลี่ย {baht(weekTotal / Math.max(1, weekValues.length), 0)}/วัน</>
            ) : (
              <>เดือนนี้เทียบเดือนก่อน <Growth value={monthGrowth} /></>
            )}
          </div>
        </article>
      </section>

      {/* ---------- 3) Top selling ---------- */}
      <section className="db-top">
        <article className="db-card">
          <div className="db-card__head">
            <div>
              <h3 className="db-card__title">เครื่องดื่มขายดี Top 5</h3>
              <p className="db-card__sub">จัดอันดับตามจำนวนแก้วที่ขายได้วันนี้</p>
            </div>
          </div>
          <ol className="db-rank">
            {topDrinks.map((d, i) => (
              <li className="db-rank__item" key={d.name}>
                <span className="db-rank__no">{i + 1}</span>
                <span className="db-rank__name">{d.name}</span>
                <span className="db-rank__stat"><b>{d.qty}</b> แก้ว · {baht(d.revenue, 0)}</span>
                <span className="db-rank__bar"><i style={{ width: `${(d.qty / maxDrink) * 100}%` }} /></span>
              </li>
            ))}
          </ol>
        </article>

        <article className="db-card">
          <div className="db-card__head">
            <div>
              <h3 className="db-card__title">ท็อปปิ้งยอดนิยม (Popular Add-ons)</h3>
              <p className="db-card__sub">จำนวนครั้งที่ลูกค้าเลือกเพิ่มวันนี้</p>
            </div>
          </div>
          <ol className="db-rank">
            {TOP_ADDONS.map((a, i) => (
              <li className="db-rank__item" key={a.name}>
                <span className="db-rank__no">{i + 1}</span>
                <span className="db-rank__name">{a.name} <span style={{ fontWeight: 500, color: "var(--db-muted)", fontSize: 12 }}>{a.desc}</span></span>
                <span className="db-rank__stat"><b>{a.qty}</b> ครั้ง · {baht(a.qty * a.price, 0)}</span>
                <span className="db-rank__bar"><i style={{ width: `${(a.qty / maxAddon) * 100}%` }} /></span>
              </li>
            ))}
          </ol>

          <div className="db-sweet">
            <p className="db-sweet__title">ระดับความหวานที่ลูกค้าเลือก</p>
            <div className="db-chips">
              {SWEETNESS.map((s) => (
                <span key={s.label} className={`db-chip ${s.pct === topSweet ? "top" : ""}`}>
                  {s.label}<b>{s.pct}%</b>
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* ---------- 4) Recent transactions ---------- */}
      <section className="db-card">
        <div className="db-card__head">
          <div>
            <h3 className="db-card__title">บิลล่าสุด (Recent Transactions)</h3>
            <p className="db-card__sub">5 บิลล่าสุดของวันนี้</p>
          </div>
          <button type="button" className="db-linkbtn" onClick={() => onViewBill?.()}>
            ดูบิลทั้งหมด
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>เลขที่บิล</th>
                <th>เวลา</th>
                <th>ช่องทางชำระ</th>
                <th>รายการ</th>
                <th style={{ textAlign: "right" }}>ยอดสุทธิ</th>
                <th className="db-center">สถานะ</th>
                <th className="db-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((b) => {
                const st = STATUS_META[b.status || "completed"];
                return (
                  <tr key={b.id}>
                    <td className="db-mono">{b.id}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{b.timestamp.slice(11, 16)} น.</td>
                    <td><span className="db-method">{b.paymentLabel}</span></td>
                    <td><div className="db-items-cell">{summarize(b.items)}</div></td>
                    <td className="db-amount">{baht(b.total)}</td>
                    <td className="db-center"><span className={`db-badge db-badge--${st.cls}`}>{st.label}</span></td>
                    <td className="db-center">
                      <button type="button" className="db-view-btn" onClick={() => onViewBill?.(b.id)}>ดูรายละเอียด</button>
                    </td>
                  </tr>
                );
              })}
              {recentBills.length === 0 && (
                <tr><td colSpan="7" className="db-empty">ยังไม่มีบิลวันนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="db-foot-note">* ตัวเลขบนหน้านี้เป็นข้อมูลตัวอย่าง รอเชื่อมต่อกับข้อมูลจริงจาก Backend</p>
    </div>
  );
}