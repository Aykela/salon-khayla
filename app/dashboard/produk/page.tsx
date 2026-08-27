'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Plus, Search, Edit, Star, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@/lib/validations/schemas'
import { PageLoading } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function ProdukPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<{ id: string } & ProductFormData | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-manager'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { is_premium: false },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from('products').insert({ ...data, status: 'ACTIVE' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-manager'] })
      setShowForm(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const { error } = await supabase.from('products').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-manager'] })
      setShowForm(false)
      setEditingProduct(null)
      reset()
    },
  })

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (product: {
    id: string
    product_name: string
    brand: string
    category?: string | null
    is_premium: boolean
    price: number
    stock_volume: number
    min_stock_volume: number
    expiry_date?: string | null
  }) => {
    setEditingProduct({
      id: product.id,
      product_name: product.product_name,
      brand: product.brand,
      category: product.category || undefined,
      is_premium: product.is_premium,
      price: product.price,
      stock_volume: product.stock_volume,
      min_stock_volume: product.min_stock_volume,
      expiry_date: product.expiry_date || undefined,
    })
    setValue('product_name', product.product_name)
    setValue('brand', product.brand)
    setValue('category', product.category || '')
    setValue('is_premium', product.is_premium)
    setValue('price', product.price)
    setValue('stock_volume', product.stock_volume)
    setValue('min_stock_volume', product.min_stock_volume)
    setValue('expiry_date', product.expiry_date || '')
    setShowForm(true)
  }

  const filtered = products?.filter(p => {
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  }) || []

  const getStockLevel = (product: { stock_volume: number; allocated_stock: number; min_stock_volume: number }) => {
    const available = product.stock_volume - product.allocated_stock
    const ratio = available / product.min_stock_volume
    if (ratio < 0.2) return 'critical'
    if (ratio < 1) return 'low'
    return 'ok'
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola produk haircare salon</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingProduct(null); reset() }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
              <input
                {...register('product_name')}
                placeholder="Nama produk"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.product_name && <p className="text-xs text-red-600 mt-1">{errors.product_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merk *</label>
              <input
                {...register('brand')}
                placeholder="Loreal, Schwarzkopf, dll"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              >
                <option value="">Pilih kategori</option>
                <option value="Shampoo">Shampoo</option>
                <option value="Conditioner">Conditioner</option>
                <option value="Hair Mask">Hair Mask</option>
                <option value="Serum">Serum</option>
                <option value="Hair Cream">Hair Cream</option>
                <option value="Treatment Oil">Treatment Oil</option>
                <option value="Hair Color">Hair Color</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga per ml (Rp) *</label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="50"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok (ml) *</label>
              <input
                {...register('stock_volume', { valueAsNumber: true })}
                type="number"
                placeholder="5000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.stock_volume && <p className="text-xs text-red-600 mt-1">{errors.stock_volume.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum (ml) *</label>
              <input
                {...register('min_stock_volume', { valueAsNumber: true })}
                type="number"
                placeholder="500"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
              {errors.min_stock_volume && <p className="text-xs text-red-600 mt-1">{errors.min_stock_volume.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kadaluarsa</label>
              <input
                {...register('expiry_date')}
                type="date"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                {...register('is_premium')}
                type="checkbox"
                id="is_premium"
                className="w-4 h-4 text-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="is_premium" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Produk Premium
              </label>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : editingProduct ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingProduct(null); reset() }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk atau merk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm bg-white"
        >
          <option value="all">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="SUSPENDED">Ditangguhkan</option>
          <option value="EXPIRED">Kadaluarsa</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Produk</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stok</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Harga/ml</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kadaluarsa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const stockLevel = getStockLevel({ ...product, allocated_stock: product.allocated_stock || 0 })
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {product.brand}
                            {product.is_premium && (
                              <span className="inline-flex items-center gap-0.5 text-yellow-600">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                Premium
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {stockLevel === 'critical' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {stockLevel === 'low' && (
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        )}
                        <div>
                          <p className={`font-medium ${stockLevel === 'critical' ? 'text-red-600' : stockLevel === 'low' ? 'text-orange-600' : 'text-gray-900'}`}>
                            {(product.stock_volume - (product.allocated_stock || 0)).toFixed(0)} ml
                          </p>
                          <p className="text-xs text-gray-400">Min: {product.min_stock_volume} ml</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">Tidak ada produk ditemukan</div>
          )}
        </div>
      </div>
    </div>
  )
}
