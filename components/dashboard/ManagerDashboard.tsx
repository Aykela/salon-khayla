'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  CalendarCheck,
  CreditCard,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageLoading } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

interface ManagerDashboardProps {
  userId: string
}

export function ManagerDashboard({ userId }: ManagerDashboardProps) {
  const supabase = createClient()

  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['manager-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      const [reservations, payments, products, customers] = await Promise.all([
        supabase.from('reservations').select('id, status, total_price, booking_date, created_at'),
        supabase.from('payments').select('id, payment_status, amount, created_at'),
        supabase.from('products').select('id, product_name, brand, stock_volume, min_stock_volume, status, allocated_stock'),
        supabase.from('customer_profiles').select('id'),
      ])

      const todayReservations = reservations.data?.filter(r => r.booking_date === today) || []
      const pendingVerification = reservations.data?.filter(r => r.status === 'WAITING_VERIFICATION') || []
      const monthlyRevenue = payments.data?.filter(p =>
        p.payment_status === 'SUCCESS' && p.created_at >= firstOfMonth
      ).reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const lowStockProducts = products.data?.filter(p =>
        (p.stock_volume - p.allocated_stock) < p.min_stock_volume * 0.2
      ) || []

      return {
        todayReservations: todayReservations.length,
        pendingVerification: pendingVerification.length,
        monthlyRevenue,
        totalCustomers: customers.data?.length || 0,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5),
        recentReservations: reservations.data?.slice(-5).reverse() || [],
        products: products.data || [],
      }
    },
  })

  // Monthly revenue chart data (last 6 months)
  const { data: chartData } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()

        const { data } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'SUCCESS')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd)

        months.push({
          name: date.toLocaleDateString('id-ID', { month: 'short' }),
          pendapatan: data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        })
      }
      return months
    },
  })

  if (isLoading) return <PageLoading />

  const statCards = [
    {
      label: 'Reservasi Hari Ini',
      value: stats?.todayReservations || 0,
      icon: CalendarCheck,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Menunggu Verifikasi',
      value: stats?.pendingVerification || 0,
      icon: CreditCard,
      color: 'bg-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: TrendingUp,
      color: 'bg-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Pelanggan',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan operasional salon hari ini</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={`w-5 h-5 text-${card.color.replace('bg-', '').replace('-500', '-600')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pendapatan 6 Bulan Terakhir</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="pendapatan" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-semibold text-gray-900">Stok Menipis</h2>
            {(stats?.lowStockCount || 0) > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {stats?.lowStockCount}
              </span>
            )}
          </div>
          {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product: {
                id: string
                product_name: string
                brand: string
                stock_volume: number
                allocated_stock: number
                min_stock_volume: number
              }) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {product.stock_volume - product.allocated_stock} ml
                    </p>
                    <p className="text-xs text-gray-400">Min: {product.min_stock_volume} ml</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Semua stok aman ✓</p>
          )}
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Reservasi Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentReservations.map((reservation: {
                id: string
                booking_code?: string
                booking_date: string
                total_price: number
                status: string
              }) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {reservation.booking_code || '-'}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{formatDate(reservation.booking_date)}</td>
                  <td className="px-6 py-3 font-medium">{formatCurrency(reservation.total_price)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={reservation.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentReservations || stats.recentReservations.length === 0) && (
            <div className="text-center py-8 text-gray-500 text-sm">Belum ada reservasi</div>
          )}
        </div>
      </div>
    </div>
  )
}
