import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard'
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*, roles(role_name)')
    .eq('id', user.id)
    .single()

  const roleName = (userData?.roles as { role_name: string } | null)?.role_name || 'Customer'

  if (roleName === 'Manager') {
    return <ManagerDashboard userId={user.id} />
  } else if (roleName === 'Employee') {
    return <EmployeeDashboard userId={user.id} />
  } else {
    return <CustomerDashboard userId={user.id} />
  }
}
