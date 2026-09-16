import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import LoginPage from './pages/LoginPage'
import PosPage from './pages/PosPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/pos" element={<PosPage />} />
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Route>
    </Routes>
  )
}
