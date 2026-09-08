import { getRestaurantTable } from '../data/tables'
import { makeOrderId } from '../lib/format'
import { canTransitionOrder } from '../lib/orderStatus'
import type {
  CreateOrderInput,
  OrderItemSnapshot,
  PaymentStatus,
  OrderStatus,
  PersistedOrder,
} from '../types/order'
import { menuService } from './menuService'

interface OrderRpcResponse {
  id: string
  order_code: string
  tracking_token: string
  table_number: string
  customer_name: string
  total: number
  item_count: number
  preparation_time: string
  status: 'pending'
  created_at: string
}

interface OrderRow {
  id: string
  order_code: string
  tracking_token: string
  customer_name: string
  customer_note: string | null
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  estimated_preparation_time: string
  created_at: string
  restaurant_tables: { table_number: string } | null
  order_items: Array<{
    id: string
    menu_item_name_snapshot: string
    category_name_snapshot: string | null
    unit_price: number
    quantity: number
    note: string | null
    subtotal: number
    order_item_options: Array<{
      option_name_snapshot: string
      price_delta: number
    }>
  }>
}

const mapOrderRow = (row: OrderRow): PersistedOrder => ({
  id: row.id,
  orderCode: row.order_code,
  trackingToken: row.tracking_token,
  customerName: row.customer_name,
  customerNote: row.customer_note ?? '',
  tableNumber: row.restaurant_tables?.table_number ?? '-',
  total: row.total,
  itemCount: row.order_items.reduce((sum, item) => sum + item.quantity, 0),
  preparationTime: row.estimated_preparation_time,
  status: row.status,
  paymentStatus: row.payment_status,
  createdAt: row.created_at,
  items: row.order_items.map((item) => ({
    id: item.id,
    name: item.menu_item_name_snapshot,
    category: item.category_name_snapshot ?? 'Tanpa kategori',
    unitPrice: item.unit_price,
    quantity: item.quantity,
    note: item.note ?? '',
    subtotal: item.subtotal,
    options: item.order_item_options.map((option) => ({
      name: option.option_name_snapshot,
      priceDelta: option.price_delta,
    })),
  })),
})

const orderSelect = `id, order_code, tracking_token, customer_name, customer_note, total, status, payment_status, estimated_preparation_time, created_at,
  restaurant_tables(table_number),
  order_items(id, menu_item_name_snapshot, category_name_snapshot, unit_price, quantity, note, subtotal,
    order_item_options(option_name_snapshot, price_delta))`

const usesLocalData = () =>
  import.meta.env.VITE_DATA_MODE === 'local' ||
  (!import.meta.env.VITE_DATA_MODE && import.meta.env.DEV)

const ensureCustomerSession = async () => {
  const { requireSupabase } = await import('../lib/supabase')
  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error) throw new Error(`Sesi pelanggan gagal dimuat: ${error.message}`)
  if (!data.session) {
    const { error: signInError } = await client.auth.signInAnonymously()
    if (signInError)
      throw new Error(`Sesi pelanggan gagal dibuat: ${signInError.message}`)
  }
  return client
}

const validateLocalOrder = async (
  input: CreateOrderInput,
): Promise<PersistedOrder> => {
  if (input.restaurantSlug !== 'sajitap-demo')
    throw new Error('Restoran tidak ditemukan.')
  const table = getRestaurantTable(input.tableNumber)
  if (!table?.active) throw new Error('Meja tidak tersedia.')
  if (!input.customerName.trim()) throw new Error('Nama pemesan wajib diisi.')
  if (input.customerName.trim().length > 80)
    throw new Error('Nama pemesan terlalu panjang.')
  if (input.customerNote.length > 500)
    throw new Error('Catatan pesanan terlalu panjang.')
  if (!input.items.length) throw new Error('Keranjang masih kosong.')

  const catalog = await menuService.list()
  let total = 0
  let itemCount = 0
  let maximumMinutes = 0
  const trustedItems: OrderItemSnapshot[] = []
  for (const item of input.items) {
    if (item.note.length > 500) throw new Error('Catatan item terlalu panjang.')
    const current = catalog.find((entry) => entry.id === item.id)
    if (!current?.available)
      throw new Error(`${item.name} sedang tidak tersedia.`)
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 50
    )
      throw new Error('Jumlah item tidak valid.')
    const selectedIds = (item.selectedOptions ?? []).map(
      (option) => option.optionId,
    )
    if (new Set(selectedIds).size !== selectedIds.length)
      throw new Error('Pilihan menu berulang.')
    let addOnTotal = 0
    for (const group of current.optionGroups ?? []) {
      const selected = group.options.filter(
        (option) => selectedIds.includes(option.id) && option.available,
      )
      if (
        selected.length < group.minSelect ||
        selected.length > group.maxSelect
      )
        throw new Error(`Pilihan untuk ${group.name} tidak valid.`)
      addOnTotal += selected.reduce((sum, option) => sum + option.priceDelta, 0)
    }
    const validOptionIds = new Set(
      (current.optionGroups ?? []).flatMap((group) =>
        group.options
          .filter((option) => option.available)
          .map((option) => option.id),
      ),
    )
    if (selectedIds.some((id) => !validOptionIds.has(id)))
      throw new Error('Pilihan tambahan tidak tersedia.')
    const unitPrice = current.price + addOnTotal
    const subtotal = unitPrice * item.quantity
    total += subtotal
    itemCount += item.quantity
    maximumMinutes = Math.max(
      maximumMinutes,
      Number(current.preparationTime.match(/\d+(?=\s*menit)/)?.[0] ?? 0),
    )
    const currentOptions = (current.optionGroups ?? []).flatMap(
      (group) => group.options,
    )
    trustedItems.push({
      id: crypto.randomUUID(),
      name: current.name,
      category: current.category,
      unitPrice,
      quantity: item.quantity,
      note: item.note.trim(),
      subtotal,
      options: selectedIds.map((id) => {
        const option = currentOptions.find((entry) => entry.id === id)!
        return { name: option.name, priceDelta: option.priceDelta }
      }),
    })
  }

  const order: PersistedOrder = {
    id: crypto.randomUUID(),
    orderCode: makeOrderId(),
    trackingToken: crypto.randomUUID(),
    customerName: input.customerName.trim(),
    customerNote: input.customerNote.trim(),
    tableNumber: input.tableNumber,
    total,
    itemCount,
    preparationTime: maximumMinutes
      ? `${Math.max(5, maximumMinutes - 5)}–${maximumMinutes} menit`
      : '10–15 menit',
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    items: trustedItems,
  }
  const existing = JSON.parse(
    localStorage.getItem('sajitap-dev-orders') ?? '[]',
  ) as PersistedOrder[]
  localStorage.setItem(
    'sajitap-dev-orders',
    JSON.stringify([order, ...existing].slice(0, 20)),
  )
  return order
}

export const orderService = {
  async create(input: CreateOrderInput): Promise<PersistedOrder> {
    const dataMode = import.meta.env.VITE_DATA_MODE
    if (usesLocalData()) return validateLocalOrder(input)
    if (dataMode && dataMode !== 'supabase')
      throw new Error(`VITE_DATA_MODE tidak valid: ${dataMode}`)

    const client = await ensureCustomerSession()
    const { data, error } = await client.rpc('create_customer_order', {
      p_restaurant_slug: input.restaurantSlug,
      p_table_number: input.tableNumber,
      p_customer_name: input.customerName,
      p_customer_note: input.customerNote,
      p_items: input.items.map((item) => ({
        menu_slug: item.id,
        quantity: item.quantity,
        note: item.note,
        option_ids: (item.selectedOptions ?? []).map(
          (option) => option.optionId,
        ),
      })),
    })
    if (error) throw new Error(error.message || 'Pesanan gagal disimpan.')
    const order = data as unknown as OrderRpcResponse
    const created: PersistedOrder = {
      id: order.id,
      orderCode: order.order_code,
      trackingToken: order.tracking_token,
      customerName: order.customer_name,
      customerNote: input.customerNote.trim(),
      tableNumber: order.table_number,
      total: order.total,
      itemCount: order.item_count,
      preparationTime: order.preparation_time,
      status: order.status,
      paymentStatus: 'unpaid',
      createdAt: order.created_at,
      items: [],
    }
    return (
      (await orderService.getByCode(
        created.orderCode,
        created.trackingToken,
      )) ?? created
    )
  },

  async getByCode(
    orderCode: string,
    trackingToken: string,
  ): Promise<PersistedOrder | null> {
    if (usesLocalData()) {
      const orders = JSON.parse(
        localStorage.getItem('sajitap-dev-orders') ?? '[]',
      ) as PersistedOrder[]
      return (
        orders.find(
          (order) =>
            order.orderCode === orderCode &&
            order.trackingToken === trackingToken,
        ) ?? null
      )
    }
    const client = await ensureCustomerSession()
    const { data, error } = await client
      .from('orders')
      .select(orderSelect)
      .eq('order_code', orderCode)
      .eq('tracking_token', trackingToken)
      .maybeSingle()
    if (error) throw new Error(`Pesanan gagal dimuat: ${error.message}`)
    if (!data) return null
    return mapOrderRow(data as unknown as OrderRow)
  },

  async subscribeToStatus(
    orderId: string,
    onStatus: (status: OrderStatus) => void,
  ): Promise<() => void> {
    if (usesLocalData()) return () => undefined
    const client = await ensureCustomerSession()
    const channel = client
      .channel(`customer-order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => onStatus((payload.new as { status: OrderStatus }).status),
      )
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  },

  async listActiveForStaff(): Promise<PersistedOrder[]> {
    if (usesLocalData()) {
      const orders = JSON.parse(
        localStorage.getItem('sajitap-dev-orders') ?? '[]',
      ) as PersistedOrder[]
      return orders.filter(
        (order) => !['completed', 'cancelled'].includes(order.status),
      )
    }
    const { requireSupabase } = await import('../lib/supabase')
    const { data, error } = await requireSupabase()
      .from('orders')
      .select(orderSelect)
      .not('status', 'in', '(completed,cancelled)')
      .order('created_at')
    if (error) throw new Error(`Pesanan dapur gagal dimuat: ${error.message}`)
    return (data as unknown as OrderRow[]).map(mapOrderRow)
  },

  async listAllForStaff(): Promise<PersistedOrder[]> {
    if (usesLocalData())
      return JSON.parse(
        localStorage.getItem('sajitap-dev-orders') ?? '[]',
      ) as PersistedOrder[]
    const { requireSupabase } = await import('../lib/supabase')
    const { data, error } = await requireSupabase()
      .from('orders')
      .select(orderSelect)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Riwayat pesanan gagal dimuat: ${error.message}`)
    return (data as unknown as OrderRow[]).map(mapOrderRow)
  },

  async transitionStatus(
    order: PersistedOrder,
    nextStatus: OrderStatus,
  ): Promise<PersistedOrder> {
    if (!canTransitionOrder(order.status, nextStatus))
      throw new Error('Perubahan status tidak valid.')
    if (usesLocalData()) {
      const orders = JSON.parse(
        localStorage.getItem('sajitap-dev-orders') ?? '[]',
      ) as PersistedOrder[]
      const updated = { ...order, status: nextStatus }
      localStorage.setItem(
        'sajitap-dev-orders',
        JSON.stringify(
          orders.map((entry) => (entry.id === order.id ? updated : entry)),
        ),
      )
      return updated
    }
    const { requireSupabase } = await import('../lib/supabase')
    const { error } = await requireSupabase().rpc('transition_order_status', {
      p_order_id: order.id,
      p_next_status: nextStatus,
    })
    if (error) throw new Error(error.message || 'Status gagal diperbarui.')
    return { ...order, status: nextStatus }
  },

  async subscribeToStaffOrders(onChange: () => void): Promise<() => void> {
    if (usesLocalData()) return () => undefined
    const { requireSupabase } = await import('../lib/supabase')
    const client = requireSupabase()
    const channel = client
      .channel('staff-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        onChange,
      )
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  },

  async setPaymentStatus(
    order: PersistedOrder,
    paymentStatus: PaymentStatus,
  ): Promise<PersistedOrder> {
    if (usesLocalData()) {
      const orders = JSON.parse(
        localStorage.getItem('sajitap-dev-orders') ?? '[]',
      ) as PersistedOrder[]
      const updated = { ...order, paymentStatus }
      localStorage.setItem(
        'sajitap-dev-orders',
        JSON.stringify(
          orders.map((entry) => (entry.id === order.id ? updated : entry)),
        ),
      )
      return updated
    }
    const { requireSupabase } = await import('../lib/supabase')
    const { error } = await requireSupabase().rpc('set_order_payment_status', {
      p_order_id: order.id,
      p_payment_status: paymentStatus,
    })
    if (error)
      throw new Error(error.message || 'Status pembayaran gagal diperbarui.')
    return { ...order, paymentStatus }
  },
}
