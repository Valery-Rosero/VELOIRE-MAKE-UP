import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <AdminLayoutShell userEmail={user.email ?? ''} userName={profile?.full_name ?? null}>
      {children}
    </AdminLayoutShell>
  )
}
