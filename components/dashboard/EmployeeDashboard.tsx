'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CalendarCheck, Clock, Scissors } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageLoading } from '@/components/shared/LoadingSpinner'
import Link from 'next/link'

interface EmployeeDashboardProps {
  userId: string
}

export function EmployeeDashboard({ userId }: EmployeeDashboardProps) {
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard', userId],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!profile) return null

      const today = new Date().toISOString().split('T')[0]

      const [todayRes, upcomingRes, attendance] = await Promise.all([
        supabase
          .from('reservations')
          .select('*, service_selections(*, services(service_name))')
          .eq('employee_id', profile.id)
          .eq('booking_date', today)
          .in('status', ['PAID', 'ONGOING', 'COMPLETED']),
        supabase
          .from('reservations')
          .select('*, service_selections(*, services(service_name))')
          .eq('employee_id', profile.id)
          .gt('booking_date', today)
          .in('status', ['BOOKED', 'PAID', 'WAITING_VERIFICATION'])
          .order('booking_date', { ascending: true })
          .limit(5),
        supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', profile.id)
          .eq('date', today)
          .single(),
      ])

      return {
        employeeId: profile.id,
        todayReservations: todayRes.data || [],
        upcomingReservations: upcomingRes.data || [],
        todayAttendance: attendance.data,
      }
    },
  })

  const handleCheckIn = async () => {
    if (!data?.employeeId) return
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    if (data.todayAttendance?.check_in) {
      // Check out
      await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString(), status: 'PRESENT' })
        .eq('employee_id', data.employeeId)
        .eq('date', today)
    } else {
      // Check in
      await supabase
        .from('attendance')
        .upsert({
          employee_id: data.employeeId,
          date: today,
          check_in: new Date().toISOString(),
          status: 'PRESENT',
        })
    }
    window.location.reload()
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Pegawai</h1>
        <p className="text-gray-500 text-sm mt-1">Jadwal dan kehadiran Anda hari ini</p>
      </div>

      {/* Check In/Out */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Kehadiran Hari Ini</h2>
            <p className="text-sm text-gray-500 mt-1">
              {data?.todayAttendance?.check_in
                ? `Check-in: ${new Date(data.todayAttendance.check_in).toLocaleTimeString('id-ID')}`
                : 'Belum check-in'}
            </p>
            {data?.todayAttendance?.check_out && (
              <p className="text-sm text-gray-500">
                Check-out: {new Date(data.todayAttendance.check_out).toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>
          {!data?.todayAttendance?.check_out && (
            <button
              onClick={handleCheckIn}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition ${
                data?.todayAttendance?.check_in
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {data?.todayAttendance?.check_in ? 'Check-Out' : 'Check-In'}
            </button>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Scissors className="w-5 h-5 text-pink-500" />
          <h2 className="text-base font-semibold text-gray-900">
            Jadwal Hari Ini ({data?.todayReservations.length || 0})
          </h2>
        </div>
        {data?.todayReservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Tidak ada jadwal hari ini</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data?.todayReservations.map((res: {
              id: string
              booking_code?: string
              start_time: string
              end_time: string
              status: string
              total_price: number
              service_selections: Array<{ services: { service_name: string } }>
            }) => (
              <div key={res.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{res.booking_code}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {res.start_time} - {res.end_time}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {res.service_selections?.map((ss: { services: { service_name: string } }, i: number) => (
                        <span key={i} className="bg-pink-50 text-pink-700 text-xs px-2 py-0.5 rounded-full">
                          {ss.services?.service_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={res.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-gray-900">Jadwal Mendatang</h2>
        </div>
        {data?.upcomingReservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Tidak ada jadwal mendatang</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data?.upcomingReservations.map((res: {
              id: string
              booking_code?: string
              booking_date: string
              start_time: string
              end_time: string
              status: string
              service_selections: Array<{ services: { service_name: string } }>
            }) => (
              <div key={res.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{res.booking_code}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(res.booking_date)} • {res.start_time} - {res.end_time}
                  </p>
                </div>
                <StatusBadge status={res.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
