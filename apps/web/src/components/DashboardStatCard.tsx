import type { ReactNode } from 'react'
import { Box, Paper, Skeleton, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

export type DashboardStatTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export type DashboardStatCardProps = {
  title: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: DashboardStatTone
  loading?: boolean
}

export function DashboardStatCard({
  title,
  value,
  hint,
  icon,
  tone = 'primary',
  loading = false,
}: DashboardStatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={(t) => ({
        borderRadius: 2,
        borderColor: 'divider',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        background: `linear-gradient(180deg, ${alpha(t.palette[tone].main, 0.1)} 0%, ${alpha(t.palette[tone].main, 0.03)} 100%)`,
      })}
    >
      <Box sx={{ px: 2, py: 1.75, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
            {title}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            {loading ? (
              <Skeleton variant="text" width={96} height={34} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </Typography>
            )}
          </Box>
          {hint ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, maxWidth: 320 }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={(t) => ({
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(t.palette[tone].main, 0.14),
              color: t.palette[tone].dark,
            })}
          >
            {icon}
          </Box>
        ) : null}
      </Box>
    </Paper>
  )
}
