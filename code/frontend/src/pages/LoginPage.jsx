// Basic working login so the app shell can be tested. Owner: Kanyawee — restyle freely, keep the useAuth().login call.
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(form.username, form.password)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, width: '100%', maxWidth: 360 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Cafe POS</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Username" autoComplete="username" required autoFocus
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextField
            label="Password" type="password" autoComplete="current-password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>เข้าสู่ระบบ</Button>
        </Stack>
      </Paper>
    </Box>
  )
}
