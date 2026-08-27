import { z } from 'zod'

// ========================
// Auth Schemas
// ========================
export const loginSchema = z.object({
  email: z.string().email('Mohon masukkan alamat email yang valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Mohon masukkan alamat email yang valid'),
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 digit').max(20, 'Nomor telepon maksimal 20 digit'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus kombinasi huruf dan angka'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirm_password'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Mohon masukkan alamat email yang valid'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus kombinasi huruf dan angka'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirm_password'],
})

// ========================
// Service Schemas
// ========================
export const serviceSchema = z.object({
  service_name: z.string().min(2, 'Nama layanan minimal 2 karakter'),
  description: z.string().optional(),
  duration_minutes: z.number().min(15, 'Durasi minimal 15 menit').max(480, 'Durasi maksimal 8 jam'),
  base_price: z.number().min(0, 'Harga tidak boleh negatif'),
  is_active: z.boolean().default(true),
})

// ========================
// Product Schemas
// ========================
export const productSchema = z.object({
  product_name: z.string().min(2, 'Nama produk minimal 2 karakter'),
  brand: z.string().min(1, 'Merk wajib diisi'),
  category: z.string().optional(),
  is_premium: z.boolean().default(false),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  stock_volume: z.number().min(0, 'Stok tidak boleh negatif'),
  min_stock_volume: z.number().min(0, 'Stok minimum tidak boleh negatif'),
  expiry_date: z.string().optional(),
})

// ========================
// Reservation Schemas
// ========================
export const reservationSchema = z.object({
  employee_id: z.string().uuid('Pilih pegawai'),
  booking_date: z.string().min(1, 'Pilih tanggal reservasi'),
  start_time: z.string().min(1, 'Pilih waktu mulai'),
  service_ids: z.array(z.string().uuid()).min(1, 'Pilih minimal 1 layanan'),
  selected_products: z.record(z.string(), z.string()).optional(),
  notes: z.string().optional(),
  special_requests: z.string().optional(),
})

// ========================
// Payment Schemas
// ========================
export const uploadPaymentSchema = z.object({
  payment_method: z.enum(['BANK_TRANSFER', 'EWALLET'], {
    errorMap: () => ({ message: 'Pilih metode pembayaran' }),
  }),
  payment_proof: z.any().refine((file) => file instanceof File, 'Bukti pembayaran wajib diupload'),
})

// ========================
// Restock Schemas
// ========================
export const restockSchema = z.object({
  product_id: z.string().uuid('Pilih produk'),
  supplier_id: z.string().uuid('Pilih supplier').optional(),
  quantity_added: z.number().min(1, 'Jumlah restock harus lebih dari 0'),
  price_per_unit: z.number().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
})

// ========================
// Employee Schemas
// ========================
export const employeeSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  specialization: z.string().optional(),
  skill_level: z.enum(['Junior', 'Senior', 'Master']).optional(),
  max_hours_per_day: z.number().min(1).max(12).default(8),
})

// ========================
// Supplier Schemas
// ========================
export const supplierSchema = z.object({
  supplier_name: z.string().min(2, 'Nama supplier minimal 2 karakter'),
  contact_person: z.string().optional(),
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 digit').optional(),
  email: z.string().email('Email tidak valid').optional(),
  address: z.string().optional(),
})

// Types from schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ReservationFormData = z.infer<typeof reservationSchema>
export type ServiceFormData = z.infer<typeof serviceSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type RestockFormData = z.infer<typeof restockSchema>
export type EmployeeFormData = z.infer<typeof employeeSchema>
export type SupplierFormData = z.infer<typeof supplierSchema>
