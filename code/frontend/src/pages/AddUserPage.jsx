import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Info, Check } from 'lucide-react';
import { createUser } from '../api/users';

export default function AddUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'นายสมชาย ใจดี',
    username: 'Somchai.j',
    password: '',
    role: 'CASHIER', // 'CASHIER' หรือ 'ADMIN'
    phone: '',
    email: 'Somchai.j@example.com',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await createUser({
        username: formData.username,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        phone: formData.phone || null,
        email: formData.email || null,
      });
      alert('เพิ่มผู้ใช้สำเร็จ');
      navigate('/pos', { replace: true });
    } catch (err) {
      if (err?.status === 403) alert('ต้อง login เป็น ADMIN');
      else if (err?.status === 409) alert(`ชื่อผู้ใช้ซ้ำ: "${formData.username}"`);
      else alert(`บันทึกไม่สำเร็จ (${err?.status ?? 'no status'}): ${err?.message ?? err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col font-['Prompt',sans-serif] text-gray-800">
      <main className="flex-1 w-full overflow-y-auto px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-[380px] bg-white rounded-2xl border border-gray-200 p-5 space-y-3 shadow-sm">
          {/* Header Section */}
          <div className="text-center space-y-1 pb-2 border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mb-1">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">เพิ่มผู้ใช้งานใหม่</h2>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-2.5 text-left">
            {/* ชื่อ-นามสกุล */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* ชื่อสำหรับเข้าสู่ระบบ */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                ชื่อสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Somchai.j"
                required
                className="w-full px-3 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="mt-1 text-[10px] text-gray-400 flex items-center gap-1 font-light">
                <Info className="w-3 h-3 text-emerald-500 shrink-0" />
                ใช้สำหรับล็อกอินเข้าเครื่อง POS และระบุชื่อในใบเสร็จ
              </p>
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                รหัสผ่าน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* สิทธิ์การใช้งาน */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                สิทธิ์การใช้งาน <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100/80 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'CASHIER' }))}
                  className={`py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                    formData.role === 'CASHIER'
                      ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Check className={`w-3 h-3 ${formData.role === 'CASHIER' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>CASHIER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'ADMIN' }))}
                  className={`py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                    formData.role === 'ADMIN'
                      ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Check className={`w-3 h-3 ${formData.role === 'ADMIN' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>ADMIN</span>
                </button>
              </div>
              <p className="mt-1 text-[10px] text-gray-400 font-light">
                {formData.role === 'CASHIER'
                  ? 'สิทธิ์พนักงานคิดเงิน: เปิดบิล, รับชำระ, และพิมพ์ใบเสร็จ'
                  : 'สิทธิ์ผู้ดูแลระบบ: เข้าถึงรายงาน, จัดการเมนู และตั้งค่าระบบทั้งหมด'}
              </p>
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์ <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08X-XXX-XXXX"
                className="w-full px-3 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* อีเมล */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                อีเมล <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Somchai.j@example.com"
                className="w-full px-3 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="py-2 bg-[#ff5722] hover:bg-[#f4511e] text-white rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>สร้างบัญชี</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
        <div>Cafe POS System &nbsp;|&nbsp; Build POS-v2.1.0 [Production]</div>
        <div>สงวนลิขสิทธิ์ © 2026 Cafe Management Solutions Co., Ltd.</div>
      </footer>
    </div>
  );
}