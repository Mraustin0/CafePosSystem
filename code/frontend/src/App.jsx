import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Info, Check } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    fullName: 'นายสมชาย ใจดี',
    username: 'Somchai.j',
    password: '',
    role: 'CASHIER', // 'CASHIER' หรือ 'ADMIN'
    phone: '',
    email: 'Somchai.j@example.com',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('บันทึกข้อมูล:', formData);
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans text-gray-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs text-gray-600 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-gray-900 text-sm">Cafe Management System</span>
        </div>
      </header>

      {/* Main Content Area (จัดกลาง + รองรับ Scroll บนหน้าจอเล็ก) */}
      <main className="flex-1 overflow-y-auto px-4">
        <div className="min-h-full flex items-center justify-center py-6">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-3.5 text-left shadow-sm">
            
            {/* Header Section (อยู่ตรงกลางอันเดียว) */}
            <div className="text-center space-y-1 pb-1 border-b border-gray-100">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 mb-0.5">
                <UserPlus className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">เพิ่มผู้ใช้งานใหม่</h1>
            </div>

            {/* Form Content (ชิดซ้ายทั้งหมด) */}
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              {/* ชื่อ-นามสกุล */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="นายสมชาย ใจดี"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              {/* ชื่อสำหรับเข้าสู่ระบบ */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ชื่อสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Somchai.j"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
                <p className="mt-0.5 text-[10px] text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3 text-emerald-600 shrink-0" />
                  ใช้สำหรับล็อกอินเข้าเครื่อง POS และระบุชื่อในใบเสร็จ
                </p>
              </div>

              {/* รหัสผ่าน */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  รหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* สิทธิ์การใช้งาน */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  สิทธิ์การใช้งาน <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: 'CASHIER' }))}
                    className={`py-1.5 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
                      formData.role === 'CASHIER'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${formData.role === 'CASHIER' ? 'opacity-100' : 'opacity-0'}`} />
                    <span>CASHIER</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: 'ADMIN' }))}
                    className={`py-1.5 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
                      formData.role === 'ADMIN'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${formData.role === 'ADMIN' ? 'opacity-100' : 'opacity-0'}`} />
                    <span>ADMIN</span>
                  </button>
                </div>
                <p className="mt-0.5 text-[10px] text-gray-500">
                  {formData.role === 'CASHIER'
                    ? 'สิทธิ์พนักงานคิดเงิน: เปิดบิล, รับชำระ, และพิมพ์ใบเสร็จ'
                    : 'สิทธิ์ผู้ดูแลระบบ: เข้าถึงรายงาน, จัดการเมนู และตั้งค่าระบบทั้งหมด'}
                </p>
              </div>

              {/* เบอร์โทรศัพท์ */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  เบอร์โทรศัพท์ <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* อีเมล */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  อีเมล <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Somchai.j@example.com"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  className="py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2 bg-[#ff5722] hover:bg-[#f4511e] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>สร้างบัญชี</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-[10px] text-gray-400 shrink-0">
        <div>
          Cafe POS System &nbsp;|&nbsp; Build POS-v2.1.0 [Production] &nbsp;|&nbsp; Database Status: <span className="text-emerald-600 font-medium">Connected</span>
        </div>
        <div>สงวนลิขสิทธิ์ © 2026 Cafe Management Solutions Co., Ltd.</div>
      </footer>
    </div>
  );
}