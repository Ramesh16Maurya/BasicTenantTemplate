'use client'

import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppTopNav } from '@/components/AppTopNav'
import { APP_TOOLBAR_MIN_HEIGHT_SM, APP_TOOLBAR_MIN_HEIGHT_XS, PAGE_GUTTER_X } from '@/components/layoutConstants'

type TenantOption = { id: string; name: string }

export function AppShell({
  children,
  userName,
  tenants,
  tenantId,
  permissionCodes,
}: {
  children: ReactNode
  userName: string
  tenants: TenantOption[]
  tenantId: string | null
  permissionCodes: string[]
}) {
  const router = useRouter()

  const onTenantChange = async (id: string) => {
    await fetch('/api/auth/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: id }),
    })
    router.refresh()
  }

  const onLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader
        tenants={tenants}
        tenantId={tenantId}
        onTenantChange={onTenantChange}
        userName={userName}
        onLogout={onLogout}
      />
      <AppTopNav permissionCodes={permissionCodes} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: {
            xs: `calc(${APP_TOOLBAR_MIN_HEIGHT_XS}px + 44px + 16px)`,
            sm: `calc(${APP_TOOLBAR_MIN_HEIGHT_SM}px + 44px + 16px)`,
          },
          px: PAGE_GUTTER_X,
          pb: PAGE_GUTTER_X,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
