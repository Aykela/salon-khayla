export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          role_name: string
          description: string | null
          permissions: Json | null
        }
        Insert: {
          id?: string
          role_name: string
          description?: string | null
          permissions?: Json | null
        }
        Update: {
          id?: string
          role_name?: string
          description?: string | null
          permissions?: Json | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          phone_number: string | null
          role_id: string | null
          is_active: boolean
          email_verified: boolean
          failed_login_attempts: number
          locked_until: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          phone_number?: string | null
          role_id?: string | null
          is_active?: boolean
          email_verified?: boolean
          failed_login_attempts?: number
          locked_until?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          phone_number?: string | null
          role_id?: string | null
          is_active?: boolean
          email_verified?: boolean
          failed_login_attempts?: number
          locked_until?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_profiles: {
        Row: {
          id: string
          user_id: string
          specialization: string | null
          skill_level: string | null
          max_hours_per_day: number
          available_days: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialization?: string | null
          skill_level?: string | null
          max_hours_per_day?: number
          available_days?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialization?: string | null
          skill_level?: string | null
          max_hours_per_day?: number
          available_days?: Json | null
          created_at?: string
        }
      }
      customer_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          gender: string | null
          total_transactions: number
          total_spent: number
          credit_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          gender?: string | null
          total_transactions?: number
          total_spent?: number
          credit_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string | null
          gender?: string | null
          total_transactions?: number
          total_spent?: number
          credit_balance?: number
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          service_name: string
          description: string | null
          duration_minutes: number
          base_price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_name: string
          description?: string | null
          duration_minutes: number
          base_price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_name?: string
          description?: string | null
          duration_minutes?: number
          base_price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          product_name: string
          brand: string
          category: string | null
          is_premium: boolean
          price: number
          stock_volume: number
          min_stock_volume: number
          allocated_stock: number
          expiry_date: string | null
          is_active: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_name: string
          brand: string
          category?: string | null
          is_premium?: boolean
          price: number
          stock_volume: number
          min_stock_volume: number
          allocated_stock?: number
          expiry_date?: string | null
          is_active?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          brand?: string
          category?: string | null
          is_premium?: boolean
          price?: number
          stock_volume?: number
          min_stock_volume?: number
          allocated_stock?: number
          expiry_date?: string | null
          is_active?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_products: {
        Row: {
          id: string
          service_id: string
          product_id: string
          formula_volume_ml: number
          is_required: boolean
          can_be_replaced: boolean
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          product_id: string
          formula_volume_ml: number
          is_required?: boolean
          can_be_replaced?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          product_id?: string
          formula_volume_ml?: number
          is_required?: boolean
          can_be_replaced?: boolean
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          customer_id: string
          employee_id: string
          booking_date: string
          start_time: string
          end_time: string
          total_duration: number
          status: string
          total_price: number
          notes: string | null
          special_requests: string | null
          booking_code: string | null
          barcode: string | null
          confirmed_at: string | null
          paid_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          payment_deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          employee_id: string
          booking_date: string
          start_time: string
          end_time: string
          total_duration: number
          status?: string
          total_price: number
          notes?: string | null
          special_requests?: string | null
          booking_code?: string | null
          barcode?: string | null
          confirmed_at?: string | null
          paid_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          payment_deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          employee_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          total_duration?: number
          status?: string
          total_price?: number
          notes?: string | null
          special_requests?: string | null
          booking_code?: string | null
          barcode?: string | null
          confirmed_at?: string | null
          paid_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          payment_deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_selections: {
        Row: {
          id: string
          reservation_id: string
          service_id: string
          selected_product_id: string | null
          price_at_booking: number
          product_price_at_booking: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          service_id: string
          selected_product_id?: string | null
          price_at_booking: number
          product_price_at_booking?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          service_id?: string
          selected_product_id?: string | null
          price_at_booking?: number
          product_price_at_booking?: number | null
          status?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          reservation_id: string
          amount: number
          payment_method: string
          payment_status: string
          payment_proof: string | null
          verification_status: string | null
          verified_by: string | null
          verified_at: string | null
          payment_date: string | null
          refund_amount: number | null
          refund_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          amount: number
          payment_method: string
          payment_status?: string
          payment_proof?: string | null
          verification_status?: string | null
          verified_by?: string | null
          verified_at?: string | null
          payment_date?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          amount?: number
          payment_method?: string
          payment_status?: string
          payment_proof?: string | null
          verification_status?: string | null
          verified_by?: string | null
          verified_at?: string | null
          payment_date?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          supplier_name: string
          contact_person: string | null
          phone_number: string | null
          email: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_name: string
          contact_person?: string | null
          phone_number?: string | null
          email?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_name?: string
          contact_person?: string | null
          phone_number?: string | null
          email?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          day_of_week: number
          open_time: string
          close_time: string
          is_closed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          open_time: string
          close_time: string
          is_closed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          open_time?: string
          close_time?: string
          is_closed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          date: string
          check_in: string | null
          check_out: string | null
          status: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          check_in?: string | null
          check_out?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          check_in?: string | null
          check_out?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restock_logs: {
        Row: {
          id: string
          product_id: string
          supplier_id: string | null
          quantity_added: number
          price_per_unit: number | null
          total_price: number | null
          invoice_number: string | null
          notes: string | null
          performed_by: string | null
          restock_date: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          supplier_id?: string | null
          quantity_added: number
          price_per_unit?: number | null
          total_price?: number | null
          invoice_number?: string | null
          notes?: string | null
          performed_by?: string | null
          restock_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          supplier_id?: string | null
          quantity_added?: number
          price_per_unit?: number | null
          total_price?: number | null
          invoice_number?: string | null
          notes?: string | null
          performed_by?: string | null
          restock_date?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          activity_type: string
          table_name: string | null
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          activity_type: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          activity_type?: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Role names
export type RoleName = 'Manager' | 'Employee' | 'Customer'

// Reservation status
export type ReservationStatus = 
  | 'DRAFT'
  | 'BOOKED'
  | 'WAITING_VERIFICATION'
  | 'PAID'
  | 'ONGOING'
  | 'COMPLETED'
  | 'PARTIALLY_COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW'
  | 'CLOSED'

// Payment status
export type PaymentStatus = 
  | 'UNPAID'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIAL_REFUND'

// Product status
export type ProductStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
