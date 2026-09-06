import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { MenuDetailPage } from './pages/MenuDetailPage'
import { MenuPage } from './pages/MenuPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { TableQrPage } from './pages/TableQrPage'
import { useTableStore, normalizeTableNumber } from './store/tableStore'
import { CustomerTableGate } from './components/layout/CustomerTableGate'

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
export default function App() {
  return (
    <Layout>
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
        <Route path="/admin/tables" element={<TableQrPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
