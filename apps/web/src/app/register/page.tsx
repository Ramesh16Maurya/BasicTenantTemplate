'use client'

import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, tenantName }),
    })
    setLoading(false)
    if (!res.ok) {
      const j = (await res.json()) as { error?: unknown }
      setError(typeof j.error === 'string' ? j.error : 'Registration failed')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)' }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Create account
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required fullWidth />
              <TextField label="Tenant name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required fullWidth />
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
              <TextField
                label="Password (min 8)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={loading} fullWidth>
                {loading ? 'Creating…' : 'Register'}
              </Button>
            </Stack>
          </form>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link href="/login">Back to sign in</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}
