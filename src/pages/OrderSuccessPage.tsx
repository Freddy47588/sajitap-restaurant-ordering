import { Navigate } from 'react-router-dom'
import { withTable } from '../lib/table'
import { useOrderStore } from '../store/orderStore'
export function OrderSuccessPage() {
  const order = useOrderStore((state) => state.latestOrder)
  return (
    <Navigate
      replace
      to={
        order
          ? withTable(`/order/${order.orderCode}`, order.tableNumber)
          : '/orders'
      }
    />
  )
}
