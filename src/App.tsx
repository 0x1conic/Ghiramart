import { Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from './components/layouts/CustomerLayout'
import { AdminLayout } from './components/layouts/AdminLayout'
import { HomePage } from './pages/customer/HomePage'
import { MarketPage } from './pages/customer/MarketPage'
import { ProductPage } from './pages/customer/ProductPage'
import { CartPage } from './pages/customer/CartPage'
import { CheckoutPage } from './pages/customer/CheckoutPage'
import { ConfirmationPage } from './pages/customer/ConfirmationPage'
import { LoginPage, PasswordRecoveryPage, RegisterPage } from './pages/customer/AuthPages'
import { StatesPage } from './pages/customer/StatesPage'
import { MemberDashboardPage } from './pages/member/MemberDashboardPage'
import { AddressesPage } from './pages/member/AddressesPage'
import { OrdersPage } from './pages/member/OrdersPage'
import { RewardsPage } from './pages/member/RewardsPage'
import { AccountPage } from './pages/member/AccountPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { ProductEditorPage } from './pages/admin/ProductEditorPage'
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage'
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage'
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="search" element={<Navigate replace to="/market" />} />
        <Route path="products/:productId" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderId" element={<ConfirmationPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<PasswordRecoveryPage />} />
        <Route path="reset-password" element={<PasswordRecoveryPage />} />
        <Route path="member" element={<MemberDashboardPage />} />
        <Route path="member/addresses" element={<AddressesPage />} />
        <Route path="member/orders" element={<OrdersPage />} />
        <Route path="member/orders/:orderId" element={<OrdersPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="states" element={<StatesPage />} />
      </Route>

      <Route path="admin">
        <Route index element={<AdminLoginPage />} />
        <Route path="login" element={<Navigate replace to="/admin" />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<ProductEditorPage />} />
          <Route path="products/:productId/edit" element={<ProductEditorPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="rewards" element={<AdminCustomersPage rewardsOnly />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
