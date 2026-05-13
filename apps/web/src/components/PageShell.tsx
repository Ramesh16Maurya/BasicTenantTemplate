import { alpha, Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { PAGE_GUTTER_X } from '@/components/layoutConstants'

type PageShellProps = {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function PageShell({ title, description, actions, children }: PageShellProps) {
  const titleBandTall = Boolean(description)
  return (
    <Box sx={{ mb: 0.25 }}>
      <Box
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: titleBandTall ? 'flex-start' : 'center' },
            justifyContent: 'space-between',
            gap: titleBandTall ? 1.75 : 1.5,
            flexWrap: 'wrap',
            px: PAGE_GUTTER_X,
            py: titleBandTall ? { xs: 1.5, sm: 1.75 } : 1,
            boxSizing: 'border-box',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.09),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.125rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.35,
              }}
            >
              {title}
            </Typography>
            {description ? (
              <Box sx={{ mt: 0.5, maxWidth: 720, color: 'text.secondary', fontSize: '0.875rem' }}>
                {description}
              </Box>
            ) : null}
          </Box>
          {actions ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{actions}</Box>
          ) : null}
        </Box>
        <Box sx={{ bgcolor: 'background.paper', px: PAGE_GUTTER_X, py: { xs: 1.5, md: 2 } }}>{children}</Box>
      </Box>
    </Box>
  )
}
