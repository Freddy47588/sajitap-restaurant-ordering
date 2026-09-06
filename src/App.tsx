import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { MenuDetailPage } from './pages/MenuDetailPage'
import { MenuPage } from './pages/MenuPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { useTableStore, normalizeTableNumber } from './store/tableStore'

function TableEntry() {
  const { tableNumber } = useParams()
  const table = normalizeTableNumber(tableNumber)
  useTableStore.getState().setTableNumber(table)
  return <Navigate replace to={table ? `/?table=${table}` : '/'} />
}
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/t/:tableNumber" element={<TableEntry />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:id" element={<MenuDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
