'use client'

import { alpha, Box, Tab, Tabs } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { APP_TOOLBAR_MIN_HEIGHT_SM, APP_TOOLBAR_MIN_HEIGHT_XS } from '@/components/layoutConstants'
import { PERMISSIONS } from '@repo/contracts'

const NAV_ITEMS: { href: string; label: string; permission: string }[] = [
  { href: '/', label: 'Dashboard', permission: PERMISSIONS.NAV_DASHBOARD },
  { href: '/goods', label: 'Goods', permission: PERMISSIONS.NAV_GOODS },
  { href: '/locations', label: 'Locations', permission: PERMISSIONS.NAV_LOCATIONS },
  { href: '/movements', label: 'Movements', permission: PERMISSIONS.NAV_MOVEMENTS },
]

export function AppTopNav({ permissionCodes }: { permissionCodes: string[] }) {
  const pathname = usePathname()
  const allowed = new Set(permissionCodes)
  const visible = NAV_ITEMS.filter((n) => allowed.has(n.permission))
  const value = visible.some((v) => v.href === pathname) ? pathname : false

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: APP_TOOLBAR_MIN_HEIGHT_XS, sm: APP_TOOLBAR_MIN_HEIGHT_SM },
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar - 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 2.5, md: 3 },
        overflowX: 'auto',
      }}
    >
      <Tabs
        value={value === false ? false : value}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          '& .MuiTab-root': {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            mx: 0.25,
          },
          '& .Mui-selected': (t) => ({
            color: `${t.palette.primary.main} !important`,
            bgcolor: alpha(t.palette.primary.main, 0.09),
          }),
        }}
      >
        {visible.map((item) => (
          <Tab
            key={item.href}
            label={item.label}
            value={item.href}
            href={item.href}
            component={Link}
            replace
            aria-current={pathname === item.href ? 'page' : undefined}
          />
        ))}
      </Tabs>
    </Box>
  )
}
