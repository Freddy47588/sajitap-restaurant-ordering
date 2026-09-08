import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { useTableStore, normalizeTableNumber } from './store/tableStore'
import { CustomerTableGate } from './components/layout/CustomerTableGate'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

const CartPage = lazy(() =>
  import('./pages/CartPage').then((module) => ({ default: module.CartPage })),
)
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((module) => ({
    default: module.CheckoutPage,
  })),
)
const MenuPage = lazy(() =>
  import('./pages/MenuPage').then((module) => ({ default: module.MenuPage })),
)
const MenuDetailPage = lazy(() =>
  import('./pages/MenuDetailPage').then((module) => ({
    default: module.MenuDetailPage,
  })),
)
const MyOrdersPage = lazy(() =>
  import('./pages/MyOrdersPage').then((module) => ({
    default: module.MyOrdersPage,
  })),
)
const OrderSuccessPage = lazy(() =>
  import('./pages/OrderSuccessPage').then((module) => ({
    default: module.OrderSuccessPage,
  })),
)
const OrderTrackingPage = lazy(() =>
  import('./pages/OrderTrackingPage').then((module) => ({
    default: module.OrderTrackingPage,
  })),
)
const StaffLoginPage = lazy(() =>
  import('./pages/StaffLoginPage').then((module) => ({
    default: module.StaffLoginPage,
  })),
)
const KitchenPage = lazy(() =>
  import('./pages/KitchenPage').then((module) => ({
    default: module.KitchenPage,
  })),
)
const CashierPage = lazy(() =>
  import('./pages/CashierPage').then((module) => ({
    default: module.CashierPage,
  })),
)
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((module) => ({
    default: module.AdminLayout,
  })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((module) => ({
    default: module.AdminOrdersPage,
  })),
)
const AdminMenuPage = lazy(() =>
  import('./pages/admin/AdminMenuPage').then((module) => ({
    default: module.AdminMenuPage,
  })),
)
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((module) => ({
    default: module.AdminCategoriesPage,
  })),
)
const AdminTablesPage = lazy(() =>
  import('./pages/admin/AdminTablesPage').then((module) => ({
    default: module.AdminTablesPage,
  })),
)
const AdminStaffPage = lazy(() =>
  import('./pages/admin/AdminStaffPage').then((module) => ({
    default: module.AdminStaffPage,
  })),
)
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminAnalyticsPage').then((module) => ({
    default: module.AdminAnalyticsPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function TableEntry() {
  const { tableNumber } = useParams()
  const table = normalizeTableNumber(tableNumber)
  useTableStore.getState().setTableNumber(table)
  return (
    <Navigate
      replace
      to={`/?table=${encodeURIComponent(table ?? tableNumber ?? '')}`}
    />
  )
}

const customerPage = (page: React.ReactNode) => (
  <CustomerTableGate>{page}</CustomerTableGate>
)
const staffPage = (
  roles: Parameters<typeof ProtectedRoute>[0]['allowedRoles'],
  page: React.ReactNode,
) => <ProtectedRoute allowedRoles={roles}>{page}</ProtectedRoute>
export default function App() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div
            className="grid min-h-[50vh] place-items-center font-semibold text-stone-600"
            role="status"
            aria-live="polite"
          >
            Memuat halaman…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={customerPage(<HomePage />)} />
          <Route path="/t/:tableNumber" element={<TableEntry />} />
          <Route path="/menu" element={customerPage(<MenuPage />)} />
          <Route path="/menu/:id" element={customerPage(<MenuDetailPage />)} />
          <Route path="/cart" element={customerPage(<CartPage />)} />
          <Route path="/checkout" element={customerPage(<CheckoutPage />)} />
          <Route
            path="/order-success"
            element={customerPage(<OrderSuccessPage />)}
          />
          <Route
            path="/order/:orderCode"
            element={customerPage(<OrderTrackingPage />)}
          />
          <Route path="/orders" element={customerPage(<MyOrdersPage />)} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/admin" element={staffPage(['admin'], <AdminLayout />)}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="tables" element={<AdminTablesPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
          <Route
            path="/kitchen"
            element={staffPage(['admin', 'kitchen'], <KitchenPage />)}
          />
          <Route
            path="/cashier"
            element={staffPage(['admin', 'cashier'], <CashierPage />)}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
