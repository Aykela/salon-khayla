import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import Navbar from '@/components/shared/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role info from our users table
  const { data: userData } = await supabase
    .from('users')
    .select('*, roles(role_name)')
    .eq('id', user.id)
    .single()

  const roleName = (userData?.roles as { role_name: string } | null)?.role_name || 'Customer'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar roleName={roleName} userName={userData?.full_name || user.email || ''} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userData?.full_name || user.email || ''} roleName={roleName} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
