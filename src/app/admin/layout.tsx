import { createAdminClient } from '@/lib/supabase/server'
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName: string | null = null
  if (user) {
    const { data: rows } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .limit(1)
    userName = (rows as Array<{ full_name: string | null }> | null)?.[0]?.full_name ?? null
  }

  return (
    <AdminLayoutShell userEmail={user?.email ?? ''} userName={userName}>
      {children}
    </AdminLayoutShell>
  )
}
