import { redirect } from 'next/navigation'
import { AppShell } from './shell-client'
import { getSession } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const tenants = session.tenants.map((t) => ({ id: t.tenantId, name: t.tenantName }))

  return (
    <AppShell
      userName={session.user.fullName}
      tenants={tenants}
      tenantId={session.tenantId}
      permissionCodes={session.permissionCodes}
    >
      {children}
    </AppShell>
  )
}
