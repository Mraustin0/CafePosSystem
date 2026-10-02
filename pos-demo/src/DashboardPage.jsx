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
  { name: 'Coffee', value: 43, color: '#10B981' },
  { name: 'Tea', value: 24, color: '#FF5733' },
  { name: 'Milk', value: 13, color: '#6EE7B7' },
  { name: 'Bakery', value: 20, color: '#FCA5A5' },
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
    <div className="w-full space-y-4 text-gray-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard สรุปการขาย</h1>
          <p className="text-xs text-gray-500 mt-0.5">ภาพรวมรายได้ ยอดขายตามช่องทาง และสถิติออเดอร์ประจำวัน</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 w-fit shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>อัปเดตล่าสุด: เมื่อสักครู่</span>
        </div>
      </div>

      {/* Top 4 Stat Cards Grid — fixed 4 columns that flex to fill available width */}
      <div className="grid grid-cols-4 gap-3">

        {/* Card 1: ยอดขายวันนี้ */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-gray-500 truncate">ยอดขายวันนี้</span>
            <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
              ฿
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">฿12,400</div>
            <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +8.2% <span className="text-gray-400 font-normal">เทียบกับเมื่อวาน</span>
            </div>
          </div>
        </div>

        {/* Card 2: ออเดอร์วันนี้ */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-500 truncate">ออเดอร์วันนี้</span>
            <span className="text-xs font-medium text-gray-400 shrink-0">รวม 193 บิล</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 mt-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="text-center flex-1 min-w-0">
              <div className="text-[10px] font-bold text-emerald-600">PAID</div>
              <div className="text-sm font-extrabold text-gray-800">184</div>
            </div>
            <div className="w-px h-6 bg-gray-200 shrink-0"></div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[10px] font-bold text-amber-500">PENDING</div>
              <div className="text-sm font-extrabold text-gray-800">6</div>
            </div>
            <div className="w-px h-6 bg-gray-200 shrink-0"></div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[10px] font-bold text-rose-500">CANCEL</div>
              <div className="text-sm font-extrabold text-gray-800">3</div>
            </div>
          </div>
        </div>

        {/* Card 3: บิลที่มีส่วนลด */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-gray-500 truncate">จำนวนบิลที่มีส่วนลด</span>
            <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              4 <span className="text-sm font-normal text-gray-500">บิล</span>
            </div>
            <div className="text-xs text-gray-400 mt-1.5 truncate">จากทั้งหมด 152 บิลวันนี้</div>
          </div>
        </div>

        {/* Card 4: ส่วนลดที่ให้ไปวันนี้ */}
        <div className="bg-white p-4 rounded-2xl border-2 border-orange-400 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold text-gray-500 truncate">ส่วนลดที่ให้ไปวันนี้</span>
            <div className="w-6 h-6 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-orange-500 tracking-tight">฿640</div>
            <div className="text-xs text-gray-400 mt-1.5 truncate">คิดเป็น 4.9% ของยอดขาย</div>
          </div>
        </div>

      </div>

      {/* Middle Section — fixed 2 columns that flex to fill available width */}
      <div className="grid grid-cols-2 gap-3">

        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4 min-w-0">
          <div>
            <div className="flex justify-between items-center gap-2">
              <h2 className="font-bold text-gray-800 text-sm">ช่องทางการชำระเงิน</h2>
              <button className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200/60 px-2.5 py-1 rounded-lg font-medium transition-colors">
                วันนี้ <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 mb-4">สัดส่วนรายรับแบ่งตามวิธีการรับเงินของแคชเชียร์</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="font-semibold text-gray-800">QR_Code (PromptPay)</span>
                  </div>
                  <span className="font-bold text-orange-500">52%</span>
                </div>
                <div className="w-full bg-orange-100/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '52%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>฿6,474 จาก 96 บิล</span>
                  <span>เฉลี่ย ฿67.4/บิล</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    <span className="font-semibold text-gray-800">Cash (เงินสด)</span>
                  </div>
                  <span className="font-bold text-orange-500">33%</span>
                </div>
                <div className="w-full bg-amber-100/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full rounded-full" style={{ width: '33%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>฿4,108 จาก 61 บิล</span>
                  <span>เฉลี่ย ฿67.3/บิล</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-emerald-600 font-medium">
            <span>* ช่องทางอื่นๆ (Credit Card, App): 15% (฿1,818 จาก 27 บิล)</span>
            <span className="font-bold shrink-0">รวม 100% (184 บิล)</span>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-sm">ยอดขายตามหมวดหมู่</h2>
            <span className="text-xs text-gray-400">4 หมวดหมู่หลัก</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around my-auto py-4 gap-5">
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

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2.5 text-xs w-full sm:w-auto">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="font-bold text-gray-900 ml-auto sm:ml-5">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Weekly Sales Chart */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">ยอดขายรายสัปดาห์</h2>
            <p className="text-xs text-gray-400 mt-0.5">แนวโน้มรายได้ตลอดสัปดาห์พร้อมจุดวิเคราะห์ยอดพีค</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-500" /> 7 วันล่าสุด
          </button>
        </div>

        <div className="h-48 sm:h-56 w-full pt-2 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `฿${v/1000}k`} />
              <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'ยอดขาย']} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorAmount)"
                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-100 text-xs gap-3">
          <div>
            <span className="text-gray-400">วันที่ขายดีที่สุด</span>
            <span className="font-bold text-gray-900 ml-2">วันเสาร์ (฿14,650)</span>
          </div>
          <div className="flex gap-5">
            <div><span className="text-gray-400">ยอดรวม 7 วัน</span> <span className="font-bold text-gray-900 ml-1.5">฿78,920</span></div>
            <div><span className="text-gray-400">เฉลี่ยต่อวัน</span> <span className="font-bold text-emerald-600 ml-1.5">฿11,274</span></div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3 min-w-0">
        <h2 className="font-bold text-gray-800 text-sm">รายการออเดอร์ล่าสุดวันนี้</h2>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs text-gray-600 min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <th className="py-2.5 px-3 text-left">เลขที่บิล</th>
                <th className="py-2.5 px-3 text-center">จำนวนรายการสินค้า</th>
                <th className="py-2.5 px-3 text-center">จำนวนสินค้า</th>
                <th className="py-2.5 px-3 text-center">จำนวนเงินที่ลด</th>
                <th className="py-2.5 px-3 text-center">ยอดสุทธิ</th>
                <th className="py-2.5 px-3 text-left">วันเวลาที่เปิดบิล</th>
                <th className="py-2.5 px-3 text-center">ชำระเงิน</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-gray-900">{row.id}</td>
                  <td className="py-2.5 px-3 text-center">{row.itemsCount}</td>
                  <td className="py-2.5 px-3 text-center">{row.qty}</td>
                  <td className={`py-2.5 px-3 text-center font-semibold ${row.discount !== '฿0' ? 'text-orange-500' : 'text-gray-400'}`}>
                    {row.discount}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-gray-900">{row.total}</td>
                  <td className="py-2.5 px-3 text-left text-gray-500">{row.time}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-medium border border-gray-200/60">
                      {row.payment}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold text-[10px] tracking-wide ${
                      row.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
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
