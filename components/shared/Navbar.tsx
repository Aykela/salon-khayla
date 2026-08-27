'use client'

import { Bell } from 'lucide-react'

interface NavbarProps {
  userName: string
  roleName: string
}

export default function Navbar({ userName, roleName }: NavbarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div>
        <h2 className="text-sm text-gray-500">
          Selamat datang kembali, <span className="font-semibold text-gray-800">{userName.split(' ')[0]}</span> 👋
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
