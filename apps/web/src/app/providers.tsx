'use client'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { createBillingTheme } from '@/theme'

export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createBillingTheme(), [])
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
