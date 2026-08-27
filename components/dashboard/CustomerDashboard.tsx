'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CalendarCheck, History, Scissors, CreditCard } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageLoading } from '@/components/shared/LoadingSpinner'
import Link from 'next/link'

interface CustomerDashboardProps {
  userId: string
}

export function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ['customer-dashboard', userId],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!profile) return null

      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          *,
          service_selections(*, services(service_name)),
          payments(payment_status),
          employee_profiles(users(full_name))
        `)
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const activeReservation = reservations?.find(r =>
        ['BOOKED', 'WAITING_VERIFICATION', 'PAID'].includes(r.status)
      )

      return {
        profile,
        reservations: reservations || [],
        activeReservation,
      }
    },
  })

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beranda</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di Salon Khayla Mazaya</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-pink-50 p-2.5 rounded-xl">
              <Scissors className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Kunjungan</p>
              <p className="text-xl font-bold text-gray-900">{data?.profile?.total_transactions || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Saldo Kredit</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data?.profile?.credit_balance || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Reservation Alert */}
      {data?.activeReservation && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck className="w-4 h-4 text-pink-600" />
                <p className="text-sm font-semibold text-pink-800">Reservasi Aktif</p>
              </div>
              <p className="text-base font-bold text-gray-900">{data.activeReservation.booking_code}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(data.activeReservation.booking_date)} • {data.activeReservation.start_time}
              </p>
              <p className="text-sm font-semibold text-pink-600 mt-1">
                {formatCurrency(data.activeReservation.total_price)}
              </p>
            </div>
            <StatusBadge status={data.activeReservation.status} />
          </div>

          {/* Show payment upload button if BOOKED */}
          {data.activeReservation.status === 'BOOKED' && (
            <Link
              href={`/dashboard/riwayat/${data.activeReservation.id}`}
              className="mt-4 block w-full bg-pink-500 hover:bg-pink-600 text-white text-center text-sm font-semibold py-2.5 rounded-xl transition"
            >
              Upload Bukti Bayar
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/reservasi/buat"
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl p-5 text-center transition"
        >
          <CalendarCheck className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold text-sm">Buat Reservasi</p>
        </Link>
        <Link
          href="/dashboard/layanan-katalog"
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl p-5 text-center transition"
        >
          <Scissors className="w-6 h-6 mx-auto mb-2 text-pink-500" />
          <p className="font-semibold text-sm">Katalog Layanan</p>
        </Link>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Riwayat Reservasi</h2>
          </div>
          <Link href="/dashboard/riwayat" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
            Lihat semua
          </Link>
        </div>
        {data?.reservations.length === 0 ? (
          <div className="text-center py-8">
            <Scissors className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada reservasi</p>
            <Link
              href="/dashboard/reservasi/buat"
              className="inline-block mt-3 bg-pink-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              Buat Reservasi Pertama
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data?.reservations.map((res: {
              id: string
              booking_code?: string
              booking_date: string
              start_time: string
              total_price: number
              status: string
            }) => (
              <Link
                key={res.id}
                href={`/dashboard/riwayat/${res.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{res.booking_code || '-'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(res.booking_date)} • {res.start_time}
                  </p>
                  <p className="text-sm font-semibold text-pink-600 mt-0.5">
                    {formatCurrency(res.total_price)}
                  </p>
                </div>
                <StatusBadge status={res.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
