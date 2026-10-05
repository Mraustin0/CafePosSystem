import React from 'react';
import { 
  Clock, 
  TrendingUp, 
  Tag, 
  Calendar, 
  ChevronDown 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const categoryData = [
  { name: 'Coffee', value: 43, color: '#3E7753' },
  { name: 'Tea', value: 24, color: '#FF5733' },
  { name: 'Milk', value: 13, color: '#8EB09A' },
  { name: 'Bakery', value: 20, color: '#F59E0B' },
];

const weeklyData = [
  { day: 'จันทร์', amount: 9800 },
  { day: 'อังคาร', amount: 10500 },
  { day: 'พุธ', amount: 9200 },
  { day: 'พฤหัสบดี', amount: 11000 },
  { day: 'ศุกร์', amount: 13200 },
  { day: 'เสาร์', amount: 14650 },
  { day: 'อาทิตย์ (วันนี้)', amount: 12400 },
];

const recentOrders = [
  { id: '#POS-0193', itemsCount: '2 รายการ', qty: '2 ชิ้น', discount: '฿20', total: '฿165', time: '19-09-2569 18:14', payment: 'QR_Code', status: 'PAID' },
  { id: '#POS-0192', itemsCount: '1 รายการ', qty: '1 ชิ้น', discount: '฿0', total: '฿75', time: '19-09-2569 18:09', payment: 'Cash', status: 'PAID' },
  { id: '#POS-0191', itemsCount: '2 รายการ', qty: '3 ชิ้น', discount: '฿35', total: '฿140', time: '19-09-2569 17:58', payment: 'QR_Code', status: 'PENDING' },
  { id: '#POS-0190', itemsCount: '1 รายการ', qty: '1 ชิ้น', discount: '฿0', total: '฿55', time: '19-09-2569 17:42', payment: 'Cash', status: 'CANCEL' },
];

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col gap-5 text-gray-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Dashboard สรุปการขาย</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">ภาพรวมรายได้ ยอดขายตามช่องทาง และสถิติออเดอร์ประจำวัน</p>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 px-8 py-3 rounded-full text-sm font-semibold text-emerald-700 w-fit shrink-0 shadow-sm whitespace-nowrap">
          <Clock className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>อัปเดตล่าสุด: เมื่อสักครู่</span>
        </div>
      </div>

      {/* Top 4 Stat Cards Grid — fixed 4 columns always, natural height, tight spacing */}
      <div className="grid grid-cols-4 gap-4 shrink-0">

        {/* Card 1: ยอดขายวันนี้ */}
        <div className="bg-white px-7 py-5 rounded-2xl border-2 border-[#3E7753] shadow-xs flex flex-col gap-3 min-h-[132px] justify-center">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 leading-snug">ยอดขายวันนี้</span>
            <div className="w-6 h-6 bg-[#E2EFE6] text-[#295239] rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
              ฿
            </div>
          </div>
          <div className="text-xl font-black text-[#3E7753] tracking-tight leading-tight">฿12,400</div>
          <div className="text-[11px] text-[#3E7753] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8.2% <span className="text-gray-400 font-normal">เทียบกับเมื่อวาน</span>
          </div>
        </div>

        {/* Card 2: ออเดอร์วันนี้ */}
        <div className="bg-white px-7 py-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-3 min-h-[132px] justify-center">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 leading-snug">ออเดอร์วันนี้</span>
            <span className="text-[11px] font-medium text-gray-400">รวม 193 บิล</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-gray-50/80 p-2 rounded-xl border border-gray-100 text-center">
            <div>
              <div className="text-[10px] font-bold text-emerald-600">PAID</div>
              <div className="text-sm font-black text-gray-800 mt-0.5">184</div>
            </div>
            <div className="border-x border-gray-200/80">
              <div className="text-[10px] font-bold text-amber-500">PENDING</div>
              <div className="text-sm font-black text-gray-800 mt-0.5">6</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-500">CANCEL</div>
              <div className="text-sm font-black text-gray-800 mt-0.5">3</div>
            </div>
          </div>
        </div>

        {/* Card 3: บิลที่มีส่วนลด */}
        <div className="bg-white px-7 py-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-3 min-h-[132px] justify-center">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 leading-snug">จำนวนบิลที่มีส่วนลด</span>
            <div className="w-6 h-6 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-gray-900 tracking-tight leading-tight">
            4 <span className="text-xs font-normal text-gray-500">บิล</span>
          </div>
          <div className="text-[11px] text-gray-400">จากทั้งหมด 152 บิลวันนี้</div>
        </div>

        {/* Card 4: ส่วนลดที่ให้ไปวันนี้ */}
        <div className="bg-white px-7 py-5 rounded-2xl border-2 border-orange-400 shadow-xs flex flex-col gap-3 min-h-[132px] justify-center">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 leading-snug">ส่วนลดที่ให้ไปวันนี้</span>
            <div className="w-6 h-6 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-orange-500 tracking-tight leading-tight">฿640</div>
          <div className="text-[11px] text-gray-400">คิดเป็น 4.9% ของยอดขาย</div>
        </div>

      </div>

      {/* Middle Section — 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">

        {/* Payment Methods Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between gap-5 min-w-0 shrink-0">
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex justify-between items-center gap-2 shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 text-sm">ช่องทางการชำระเงิน</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">สัดส่วนรายรับแบ่งตามวิธีการรับเงินของแคชเชียร์</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100/80 hover:bg-gray-200/70 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0">
                วันนี้ <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 shrink-0">
              <div className="shrink-0">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="font-bold text-gray-800">QR_Code (PromptPay)</span>
                  </div>
                  <span className="font-bold text-orange-500">61%</span>
                </div>
                <div className="w-full bg-orange-100/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: '61%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                  <span>฿6,474 จาก 96 บิล</span>
                  <span>เฉลี่ย ฿67.4/บิล</span>
                </div>
              </div>

              <div className="shrink-0">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    <span className="font-bold text-gray-800">Cash (เงินสด)</span>
                  </div>
                  <span className="font-bold text-orange-500">39%</span>
                </div>
                <div className="w-full bg-amber-100/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full rounded-full transition-all duration-500" style={{ width: '39%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                  <span>฿4,108 จาก 61 บิล</span>
                  <span>เฉลี่ย ฿67.3/บิล</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 shrink-0">
            <span>รวมทั้งหมด 2 ช่องทาง</span>
            <span className="font-bold text-[#3E7753] shrink-0">รวม 100% (157 บิล)</span>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-w-0 shrink-0">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">ยอดขายตามหมวดหมู่</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">สัดส่วนสินค้าขายดีแยกตามกลุ่ม</p>
            </div>
            <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg shrink-0">4 หมวดหมู่</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around my-auto py-3 gap-5 shrink-0">
            <div className="w-32 h-32 shrink-0 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={62}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2.5 text-xs w-full sm:w-auto shrink-0">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-700 font-semibold">{item.name}</span>
                  <span className="font-bold text-gray-900 ml-auto sm:ml-6">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Weekly Sales Chart */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 min-w-0 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">ยอดขายรายสัปดาห์</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">แนวโน้มรายได้ตลอดสัปดาห์พร้อมจุดวิเคราะห์ยอดพีค</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-500" /> 7 วันล่าสุด
          </button>
        </div>

        <div className="h-48 sm:h-56 w-full pt-2 min-w-0 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3E7753" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3E7753" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `฿${v/1000}k`} />
              <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'ยอดขาย']} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3E7753" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorAmount)"
                dot={{ r: 4, fill: "#3E7753", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-100 text-xs gap-3 shrink-0">
          <div>
            <span className="text-gray-400">วันที่ขายดีที่สุด:</span>
            <span className="font-bold text-gray-900 ml-1.5">วันเสาร์ (฿14,650)</span>
          </div>
          <div className="flex gap-5 shrink-0">
            <div><span className="text-gray-400">ยอดรวม 7 วัน:</span> <span className="font-bold text-gray-900 ml-1.5">฿78,920</span></div>
            <div><span className="text-gray-400">เฉลี่ยต่อวัน:</span> <span className="font-bold text-[#3E7753] ml-1.5">฿11,274</span></div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 min-w-0 shrink-0">
        <div className="shrink-0">
          <h2 className="font-bold text-gray-800 text-sm">รายการออเดอร์ล่าสุดวันนี้</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">รายการทำธุรกรรม POS ล่าสุดประจำวัน</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 overflow-hidden shrink-0">
          <table className="w-full text-xs text-gray-600">
            <thead>
              <tr className="bg-gray-50/90 text-gray-500 font-bold border-b border-gray-200/80">
                <th className="py-2.5 px-3 text-left">เลขที่บิล</th>
                <th className="py-2.5 px-2 text-center">จำนวนรายการ</th>
                <th className="py-2.5 px-2 text-center">จำนวนสินค้า</th>
                <th className="py-2.5 px-2 text-center">ส่วนลด</th>
                <th className="py-2.5 px-2 text-center">ยอดสุทธิ</th>
                <th className="py-2.5 px-3 text-left">วันเวลาเปิดบิล</th>
                <th className="py-2.5 px-2 text-center">ชำระเงิน</th>
                <th className="py-2.5 px-2 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentOrders.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap">{row.id}</td>
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">{row.itemsCount}</td>
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">{row.qty}</td>
                  <td className={`py-2.5 px-2 text-center font-semibold whitespace-nowrap ${row.discount !== '฿0' ? 'text-orange-500' : 'text-gray-400'}`}>
                    {row.discount}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-gray-900 whitespace-nowrap">{row.total}</td>
                  <td className="py-2.5 px-3 text-left text-gray-500 whitespace-nowrap">{row.time}</td>
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-200/60">
                      {row.payment}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide ${
                      row.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                      row.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}