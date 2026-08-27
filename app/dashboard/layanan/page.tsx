'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Clock, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceSchema, type ServiceFormData } from '@/lib/validations/schemas'
import { PageLoading } from '@/components/shared/LoadingSpinner'

export default function LayananPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<{id: string} & ServiceFormData | null>(null)
  const [search, setSearch] = useState('')

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { is_active: true },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const { error } = await supabase.from('services').insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setShowForm(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceFormData }) => {
      const { error } = await supabase.from('services').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setShowForm(false)
      setEditingService(null)
      reset()
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('services').update({ is_active: !is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (service: { id: string; service_name: string; description?: string | null; duration_minutes: number; base_price: number; is_active: boolean }) => {
    setEditingService({ ...service, description: service.description || undefined })
    setValue('service_name', service.service_name)
    setValue('description', service.description || '')
    setValue('duration_minutes', service.duration_minutes)
    setValue('base_price', service.base_price)
    setValue('is_active', service.is_active)
    setShowForm(true)
  }

  const filtered = services?.filter(s =>
    s.service_name.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Layanan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola daftar layanan salon</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingService(null); reset() }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Layanan
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan *</label>
              <input
                {...register('service_name')}
                placeholder="Contoh: Hair Coloring"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.service_name && <p className="text-xs text-red-600 mt-1">{errors.service_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Dasar (Rp) *</label>
              <input
                {...register('base_price', { valueAsNumber: true })}
                type="number"
                placeholder="150000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.base_price && <p className="text-xs text-red-600 mt-1">{errors.base_price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Menit) *</label>
              <input
                {...register('duration_minutes', { valueAsNumber: true })}
                type="number"
                placeholder="60"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.duration_minutes && <p className="text-xs text-red-600 mt-1">{errors.duration_minutes.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                {...register('description')}
                placeholder="Deskripsi layanan..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm resize-none"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : editingService ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingService(null); reset() }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari layanan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm bg-white"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{service.service_name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {service.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            {service.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{service.duration_minutes} menit</span>
              </div>
              <div className="flex items-center gap-1.5 text-pink-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(service.base_price)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
              <button
                onClick={() => handleEdit(service)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => toggleActiveMutation.mutate({ id: service.id, is_active: service.is_active })}
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  service.is_active ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'
                }`}
              >
                {service.is_active ? (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Aktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Tidak ada layanan ditemukan</p>
        </div>
      )}
    </div>
  )
}
