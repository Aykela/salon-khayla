'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Package,
  CreditCard,
  BarChart3,
  Users,
  ClipboardList,
  Clock,
  History,
  PackageSearch,
  Truck,
  Scissors as ScissorsIcon,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  roleName: string
  userName: string
}

const managerMenus = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/reservasi', icon: CalendarCheck, label: 'Semua Reservasi' },
  { href: '/dashboard/verifikasi', icon: CreditCard, label: 'Verifikasi Bayar' },
  { href: '/dashboard/layanan', icon: Scissors, label: 'Layanan' },
  { href: '/dashboard/produk', icon: Package, label: 'Produk' },
  { href: '/dashboard/stok', icon: PackageSearch, label: 'Manajemen Stok' },
  { href: '/dashboard/pegawai', icon: Users, label: 'Pegawai' },
  { href: '/dashboard/supplier', icon: Truck, label: 'Supplier' },
  { href: '/dashboard/laporan', icon: BarChart3, label: 'Laporan' },
]

const employeeMenus = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/jadwal', icon: CalendarCheck, label: 'Jadwal Saya' },
  { href: '/dashboard/kehadiran', icon: Clock, label: 'Kehadiran' },
]

const customerMenus = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { href: '/dashboard/reservasi/buat', icon: CalendarCheck, label: 'Buat Reservasi' },
  { href: '/dashboard/riwayat', icon: History, label: 'Riwayat' },
  { href: '/dashboard/layanan-katalog', icon: ClipboardList, label: 'Katalog Layanan' },
]

export default function Sidebar({ roleName, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menus = roleName === 'Manager'
    ? managerMenus
    : roleName === 'Employee'
    ? employeeMenus
    : customerMenus

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-pink-500 rounded-xl flex items-center justify-center">
            <ScissorsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Salon Khayla</p>
            <p className="text-xs text-gray-400">Mazaya</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-3 border-b border-gray-100">
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          roleName === 'Manager' ? 'bg-purple-100 text-purple-700' :
          roleName === 'Employee' ? 'bg-blue-100 text-blue-700' :
          'bg-pink-100 text-pink-700'
        )}>
          {roleName === 'Manager' ? 'Manager' : roleName === 'Employee' ? 'Pegawai' : 'Pelanggan'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menus.map((menu) => {
            const isActive = pathname === menu.href || (menu.href !== '/dashboard' && pathname.startsWith(menu.href))
            return (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-pink-50 text-pink-700 border border-pink-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <menu.icon className={cn('w-4 h-4', isActive ? 'text-pink-600' : 'text-gray-400')} />
                  {menu.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-pink-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{userName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
