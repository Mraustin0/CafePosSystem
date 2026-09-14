import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import RequireAuth from './auth/RequireAuth'
import { useAuth } from './auth/useAuth'
import LoginPage from './pages/LoginPage'
import PosPage from './pages/PosPage'
import PaymentPage from './pages/PaymentPage'
import ReceiptPage from './pages/ReceiptPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import CategoriesPage from './pages/CategoriesPage'
import AddOnsPage from './pages/AddOnsPage'
import ProductsPage from './pages/ProductsPage'
import UsersPage from './pages/UsersPage'
import ReportsPage from './pages/ReportsPage'

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user.role === 'ADMIN' ? '/reports' : '/pos'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<ReceiptPage />} />
          <Route path="orders/:id/payment" element={<PaymentPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<RequireAuth roles={['ADMIN']} />}>
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="add-ons" element={<AddOnsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
