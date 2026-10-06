import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PosScreen from "./PosScreen";
import DashboardView from "./DashboardView";

export default function App() {
  const [activeNav, setActiveNav] = useState("coffee");

  return (
    <Routes>
      {/* เมื่อเข้าหน้าแรก (/) ให้ Redirect ไปที่ /pos */}
      <Route path="/" element={<Navigate to="/pos" replace />} />
      
      {/* หน้า POS Screen */}
      <Route 
        path="/pos" 
        element={<PosScreen activeNav={activeNav} setActiveNav={setActiveNav} />} 
      />
      
      {/* หน้า Dashboard*/}
      <Route path="/dashboard" element={<DashboardView />} />
    </Routes>
  );
}