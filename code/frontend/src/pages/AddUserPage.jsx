import React, { useState } from 'react';
import { Camera, Save, X, ArrowLeft, Shield, User, Mail, Phone, Building, Key } from 'lucide-react';

export default function AddUserForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    department: '',
    password: '',
    confirmPassword: '',
    status: 'active',
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    console.log('ข้อมูลผู้ใช้งานใหม่:', formData);
    alert('บันทึกข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="border-b border-gray-100 p-6 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">เพิ่มผู้ใช้งานใหม่</h1>
              <p className="text-sm text-gray-500">กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้งานใหม่ในระบบ</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-gray-800">รูปโปรไฟล์</h3>
              <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ PNG, JPG หรือ GIF (ขนาดไม่เกิน 5MB)</p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="สมชาย"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="ใจดี"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="somchai@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081-234-5678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สิทธิ์การใช้งาน (Role) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none bg-white appearance-none cursor-pointer"
                >
                  <option value="user">ผู้ใช้งานทั่วไป (User)</option>
                  <option value="editor">ผู้แก้ไขข้อมูล (Editor)</option>
                  <option value="manager">ผู้จัดการ (Manager)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
                <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                แผนก / ฝ่าย
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none bg-white appearance-none cursor-pointer"
                >
                  <option value="">-- เลือกแผนก --</option>
                  <option value="it">เทคโนโลยีสารสนเทศ (IT)</option>
                  <option value="hr">ทรัพยากรบุคคล (HR)</option>
                  <option value="marketing">การตลาด (Marketing)</option>
                  <option value="sales">ฝ่ายขาย (Sales)</option>
                  <option value="finance">การเงินและบัญชี (Finance)</option>
                </select>
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Account Status Switch */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800">สถานะเปิดใช้งานบัญชี</h4>
              <p className="text-xs text-gray-500">อนุญาตให้ผู้ใช้นี้เข้าสู่ระบบได้ทันทีหลังจากลงทะเบียน</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status === 'active'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.checked ? 'active' : 'inactive',
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>ยกเลิก</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}