import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PosScreen from "./PosScreen";
import DashboardView from "./DashboardView";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pos" replace />} />
      <Route path="/pos" element={<PosScreen />} />
      <Route path="/dashboard" element={<DashboardView />} />
    </Routes>
  );
}