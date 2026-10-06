import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";
import PosScreen from "./PosScreen";
import DashboardView from './DashboardView';

export default function App() {
  const [activeNav, setActiveNav] = useState("coffee");

  return (
    <Routes>
      <Route 
        path="/" 
        element={<MainLayout activeNav={activeNav} setActiveNav={setActiveNav} />}
      >
        <Route index element={<Navigate to="/pos" replace />} />
        <Route 
          path="pos" 
          element={<PosScreen activeNav={activeNav} setActiveNav={setActiveNav} />} 
        />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}