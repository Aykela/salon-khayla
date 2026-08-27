'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/validations/schemas'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Check if email already exists via Supabase Auth
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone_number: data.phone_number,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Email sudah terdaftar, silakan login.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (authData.user) {
        // Get Customer role ID
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('role_name', 'Customer')
          .single()

        if (roleData) {
          // Insert into users table
          await supabase.from('users').insert({
            id: authData.user.id,
            email: data.email,
            password_hash: '(managed by supabase auth)',
            full_name: data.full_name,
            phone_number: data.phone_number,
            role_id: roleData.id,
          })

          // Insert into customer_profiles
          await supabase.from('customer_profiles').insert({
            user_id: authData.user.id,
          })
        }
      }

      setSuccess(true)
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-gray-600 mb-6">
              Kami telah mengirimkan link verifikasi ke email Anda. 
              Silakan cek email dan klik link verifikasi untuk mengaktifkan akun.
            </p>
            <Link
              href="/login"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 px-6 rounded-lg transition"
            >
              Ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500 rounded-2xl mb-4 shadow-lg">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Salon Khayla Mazaya</h1>
          <p className="text-gray-500 mt-1">Buat akun pelanggan baru</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                {...register('full_name')}
                type="text"
                placeholder="Nama lengkap Anda"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-sm"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="contoh@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nomor Telepon
              </label>
              <input
                {...register('phone_number')}
                type="tel"
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-sm"
              />
              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-600">{errors.phone_number.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karakter (huruf & angka)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  {...register('confirm_password')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-pink-600 hover:text-pink-700 font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
