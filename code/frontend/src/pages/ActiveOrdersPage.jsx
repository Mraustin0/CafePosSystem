import React, { useState } from 'react'
import {
  Coffee,
  ShoppingBag,
  Utensils,
  Receipt,
  Tag,
  LayoutDashboard,
  Settings,
  Search,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp,
  Printer,
  CreditCard,
  Trash2,
  Edit3,
  QrCode,
  Banknote,
  User,
  Clock
} from 'lucide-react'

// ข้อมูลจำลองสำหรับทดสอบ UI
const MOCK_ORDERS = [
  {
    id: '#ORD-0029',
    type: 'ทานที่ร้าน (Dine-in)',
    typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    status: 'PENDING (รอชำระเงิน)',
    cashier: 'แคชเชียร์ 01 • คุณกมล',
    time: 'เปิดบิล: 14:00 น. (15 นาทีที่แล้ว)',
    total: 355.50,
    itemsSummary: 'รวม 3 รายการ (7 ชิ้น)',
    discountText: 'ส่วนลด Member 10% (-฿39.50)',
    items: [
      {
        name: 'คาปูชิโน่ / Cappuccino',
        subText: 'เย็น (Iced) • คั่วกลาง • หวาน 100%',
        notes: '+ เพิ่มช็อตกาแฟ (+Extra Shot), + วิปครีม\nโน๊ต: แยกน้ำแข็ง',
        qty: 1,
        unit: 'แก้ว',
        price: 95.00
      },
      {
        name: 'Poached Egg',
        subText: 'Size: large (฿80 x 2)',
        qty: 2,
        unit: 'ที่',
        price: 160.00
      },
      {
        name: 'Coronation',
        subText: 'Size: large (฿70 x 2)',
        qty: 2,
        unit: 'ที่',
        price: 140.00
      }
    ]
  },
  {
    id: '#ORD-0030',
    type: 'กลับบ้าน (Takeaway)',
    typeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    status: 'PENDING (รอชำระเงิน)',
    cashier: 'แคชเชียร์ 01 • ลูกค้าทั่วไป',
    time: 'เปิดบิล: 14:06 น. (9 นาทีที่แล้ว)',
    total: 255.00,
    itemsSummary: 'รวม 2 รายการ (2 ชิ้น)',
    discountText: '',
    items: [
      {
        name: 'อเมริกาโน่เย็น',
        subText: 'ไม่หวาน',
        qty: 2,
        unit: 'แก้ว',
        price: 130.00
      },
      {
        name: 'เค้กช็อกโกแลต',
        subText: '-',
        qty: 1,
        unit: 'ชิ้น',
        price: 125.00
      }
    ]
  },
  {
    id: '#ORD-0033',
    type: 'กลับบ้าน (Takeaway)',
    typeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    status: 'PENDING (รอชำระเงิน)',
    cashier: 'แคชเชียร์ 01 • ลูกค้าหน้าร้าน',
    time: 'เปิดบิล: 14:14 น. (1 นาทีที่แล้ว)',
    total: 490.00,
    itemsSummary: 'รวม 4 รายการ (5 ชิ้น)',
    discountText: '',
    items: [
      {
        name: 'มัทฉะลาเต้เย็น',
        subText: 'หวานน้อย 50%',
        qty: 2,
        unit: 'แก้ว',
        price: 190.00
      },
      {
        name: 'ครัวซองต์เนยสด',
        subText: 'อุ่นร้อน',
        qty: 3,
        unit: 'ชิ้น',
        price: 300.00
      }
    ]
  }
]

export default function ActiveOrdersPage() {
  const [orders] = useState(MOCK_ORDERS)
  const [selectedOrderId, setSelectedOrderId] = useState('#ORD-0029')
  const [expandedOrders, setExpandedOrders] = useState({ '#ORD-0029': true })

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0]

  const toggleExpand = (id, e) => {
    e.stopPropagation()
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* 🟢 1. Left Sidebar Nav */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 justify-between z-10">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo Brand */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              EP
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-4 w-full px-2">
            <button className="flex flex-col items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Coffee className="w-5 h-5" />
              <span className="text-[11px] mt-1 font-medium">กาแฟ</span>
            </button>
            <button className="flex flex-col items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Utensils className="w-5 h-5" />
              <span className="text-[11px] mt-1 font-medium">ชา</span>
            </button>
            <button className="flex flex-col items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[11px] mt-1 font-medium">เมนูขนม</span>
            </button>
            
            {/* Active Item */}
            <button className="flex flex-col items-center justify-center w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 relative shadow-sm">
              <span className="absolute -top-1 right-2 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                3
              </span>
              <Receipt className="w-5 h-5" />
              <span className="text-[11px] mt-1">บิลค้าง (3)</span>
            </button>

            <button className="flex flex-col items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Tag className="w-5 h-5" />
              <span className="text-[11px] mt-1 font-medium">โปรโมชั่น</span>
            </button>
            <button className="flex flex-col items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[11px] mt-1 font-medium">Dashboard</span>
            </button>
          </nav>
        </div>

        <button className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-600">
          <Settings className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-medium">ตั้งค่า</span>
        </button>
      </aside>

      {/* 🟡 2. Middle Main Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Easy POS Studio</span>
            <span className="text-xs text-slate-400">สาขาหลัก • Terminal 01</span>
          </div>

          {/* Search Bar Top */}
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเมนู (Search menu)..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent rounded-full text-xs focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">แคชเชียร์ 01</p>
              <p className="text-[10px] text-emerald-600 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ออนไลน์
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              K
            </div>
          </div>
        </header>

        {/* Action Header Banner */}
        <div className="px-6 py-4 flex items-center justify-between bg-slate-100">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900">
              บิลที่เปิดอยู่ <span className="text-slate-600 font-medium">(Active Orders)</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              3 บิลค้างชำระ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              รีเฟรช
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
              <Plus className="w-4 h-4" />
              เปิดบิลใหม่ (New Order)
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 pb-3 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่บิล หรือชื่อลูกค้า..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>เรียง:</span>
            <select className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700 outline-none">
              <option>นานสุด</option>
              <option>ใหม่ล่าสุด</option>
            </select>
          </div>
        </div>

        {/* Orders Accordion Cards Container */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {orders.map((order) => {
            const isSelected = selectedOrderId === order.id
            const isExpanded = !!expandedOrders[order.id]

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`bg-white rounded-2xl border transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => toggleExpand(order.id, e)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{order.id}</span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${order.typeColor}`}>
                          {order.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 font-bold rounded-md text-[11px]">
                          • {order.status}
                        </span>
                        <span>{order.cashier}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Buttons */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">ยอดรวมสุทธิ</p>
                      <p className="text-lg font-black text-amber-600">
                        ฿{order.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400">เปิด/</span>
                        <span>แก้ไขบิล</span>
                      </button>
                      <button className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1">
                        ชำระเงิน
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-2 text-[11px] text-slate-400">
                  {order.time}
                </div>

                {/* Expanded Item Cards Grid (3 Columns) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    <div className="grid grid-cols-3 gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-bold text-xs text-slate-800 leading-snug">
                                {idx + 1}. {item.name} <span className="text-emerald-600 font-extrabold">x{item.qty}</span>
                              </h4>
                              <span className="font-bold text-xs text-slate-900">
                                ฿{item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.subText}</p>
                            {item.notes && (
                              <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-md mt-1.5 whitespace-pre-line font-medium border border-amber-100">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Summary Bar inside Card */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>{order.itemsSummary}</span>
                      {order.discountText && (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          {order.discountText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 🔴 3. Right Invoice Side Panel */}
      {selectedOrder && (
        <aside className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Invoice No: 123454</span>
              <span>23/01/2024 | 14:00:23</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">รายละเอียดบิลที่เลือก</h2>
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedOrder.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ทานที่ร้าน (Dine-in) • ลูกค้า: คุณกมล (Member)
                </p>
              </div>

              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg border border-amber-200">
                PENDING (รอชำระเงิน)
              </span>
            </div>
          </div>

          {/* Selected Order Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-700 shrink-0 font-bold text-xs">
                    ☕
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">{item.subText}</p>
                    {item.notes && (
                      <p className="text-[10px] text-amber-700 mt-1 whitespace-pre-line">
                        {item.notes}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      จำนวน: {item.qty} {item.unit}
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-amber-600">
                  ฿{item.price.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Member Discount Badge */}
            {selectedOrder.discountText && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" /> ส่วนลดสมาชิก Member 10%
                </span>
                <span>-฿39.50</span>
              </div>
            )}
          </div>

          {/* Bottom Total & Payment Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">ยอดสุทธิรอชำระ (Total Due)</p>
                <p className="text-[10px] text-slate-400">4 รายการ, รวม 7 ชิ้น (รวม VAT แล้ว)</p>
              </div>
              <p className="text-2xl font-black text-amber-600">
                ฿{selectedOrder.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Quick Payment Options */}
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs">
                <QrCode className="w-4 h-4 text-emerald-600" />
                QR PromptPay
              </button>
              <button className="py-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs">
                <Banknote className="w-4 h-4 text-amber-600" />
                เงินสด (Cash)
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button className="py-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs">
                <Printer className="w-4 h-4 text-slate-400" />
                พิมพ์ใบแจ้งยอด
              </button>
              <button className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                ชำระเงินทันที
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}