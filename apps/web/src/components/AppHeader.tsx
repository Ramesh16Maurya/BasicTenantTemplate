import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { APP_TOOLBAR_MIN_HEIGHT_SM, APP_TOOLBAR_MIN_HEIGHT_XS, PAGE_GUTTER_X } from '@/components/layoutConstants'
import { getClientEnv } from '@/lib/env'

type TenantOption = { id: string; name: string }

type AppHeaderProps = {
  tenants: TenantOption[]
  tenantId: string | null
  onTenantChange: (id: string) => void
  userName: string
  onLogout: () => void
}

function searchShortcutLabel(): string {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform)) return '⌘K'
  return 'Ctrl+K'
}

export function AppHeader({ tenants, tenantId, onTenantChange, userName, onLogout }: AppHeaderProps) {
  const router = useRouter()
  const { NEXT_PUBLIC_APP_NAME } = getClientEnv()
  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const initials = useMemo(() => {
    const n = userName.trim() || '?'
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const a = parts[0]?.[0]
      const b = parts[parts.length - 1]?.[0]
      if (a && b) return (a + b).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }, [userName])

  const onSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      ;(e.target as HTMLInputElement).focus()
    }
  }, [])

  return (
    <AppBar position="fixed" sx={{ ml: 0, width: '100%' }}>
      <Toolbar
        sx={{
          gap: 1,
          minHeight: { xs: APP_TOOLBAR_MIN_HEIGHT_XS, sm: APP_TOOLBAR_MIN_HEIGHT_SM },
          px: PAGE_GUTTER_X,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1, minWidth: 0, flexShrink: 0 }}>
          <Typography variant="subtitle1" color="primary" noWrap sx={{ fontWeight: 800 }}>
            {NEXT_PUBLIC_APP_NAME}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            minWidth: 0,
            px: { xs: 0, sm: 1 },
          }}
        >
          <TextField
            size="small"
            placeholder="Search or type command…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onSearchKeyDown}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 520, lg: 640 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f7f6f4',
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary" sx={{ userSelect: 'none', opacity: 0.85 }}>
                      {searchShortcutLabel()}
                    </Typography>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          <IconButton color="inherit" size="medium" aria-label="notifications">
            <Badge color="error" variant="dot" overlap="circular">
              <NotificationsNoneOutlined />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

          {tenants.length > 0 ? (
            <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 160 } }}>
              <InputLabel id="tenant-lbl">Tenant</InputLabel>
              <Select
                labelId="tenant-lbl"
                label="Tenant"
                value={tenantId ?? ''}
                onChange={(e) => {
                  const v = String(e.target.value)
                  onTenantChange(v)
                  router.refresh()
                }}
              >
                {tenants.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ p: 0.5, ml: 0.5 }}
            aria-label="account menu"
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}>{initials}</Avatar>
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
              <Typography variant="subtitle2" noWrap>
                {userName}
              </Typography>
            </Box>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null)
                onLogout()
              }}
            >
              Log out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
