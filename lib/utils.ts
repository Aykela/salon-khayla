import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  return `${hours}:${minutes}`
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} menit`
  if (mins === 0) return `${hours} jam`
  return `${hours} jam ${mins} menit`
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    BOOKED: 'bg-blue-100 text-blue-800',
    WAITING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    ONGOING: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    PARTIALLY_COMPLETED: 'bg-orange-100 text-orange-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    NO_SHOW: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-100 text-gray-600',
    DRAFT: 'bg-gray-100 text-gray-600',
    // Payment status
    UNPAID: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUCCESS: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
    PARTIAL_REFUND: 'bg-orange-100 text-orange-800',
    // Product status
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    // Attendance status
    PRESENT: 'bg-green-100 text-green-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    ABSENT: 'bg-red-100 text-red-800',
    LEAVE: 'bg-blue-100 text-blue-800',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    BOOKED: 'Dipesan',
    WAITING_VERIFICATION: 'Menunggu Verifikasi',
    PAID: 'Lunas',
    ONGOING: 'Berlangsung',
    COMPLETED: 'Selesai',
    PARTIALLY_COMPLETED: 'Selesai Sebagian',
    CANCELLED: 'Dibatalkan',
    EXPIRED: 'Kadaluarsa',
    NO_SHOW: 'Tidak Hadir',
    CLOSED: 'Ditutup',
    DRAFT: 'Draft',
    UNPAID: 'Belum Bayar',
    PENDING: 'Menunggu',
    SUCCESS: 'Berhasil',
    FAILED: 'Gagal',
    REFUNDED: 'Dikembalikan',
    PARTIAL_REFUND: 'Dikembalikan Sebagian',
    ACTIVE: 'Aktif',
    SUSPENDED: 'Ditangguhkan',
    EXPIRED_PRODUCT: 'Kadaluarsa',
    PRESENT: 'Hadir',
    LATE: 'Terlambat',
    ABSENT: 'Tidak Hadir',
    LEAVE: 'Cuti',
  }
  return labels[status] || status
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMins = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
}

export function isWithinBusinessHours(
  startTime: string,
  endTime: string,
  openTime: string,
  closeTime: string
): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }
  return (
    toMinutes(startTime) >= toMinutes(openTime) &&
    toMinutes(endTime) <= toMinutes(closeTime)
  )
}

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  
  let currentMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  while (currentMinutes < closeMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    currentMinutes += intervalMinutes
  }

  return slots
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[dayOfWeek] || ''
}
