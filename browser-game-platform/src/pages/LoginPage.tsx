import LoginIcon from '@mui/icons-material/Login'
import { Alert, Box, Button, Container, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { type FormEvent, useState } from 'react'
import type { UserRole } from '../App'

type LoginPageProps = {
  onLogin: (role: UserRole) => void
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<UserRole>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || password.length < 6) {
      setError('Введи email та пароль мінімум з 6 символів.')
      return
    }

    onLogin(role)
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ mb: 3 }}>
          <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
            Вхід у систему
          </Typography>
          <Typography component="h1" variant="h1" sx={{ mb: 1 }}>
            Увійти
          </Typography>
          <Typography color="text.secondary">
            Це frontend-імітація входу. Пізніше тут буде Supabase Auth.
          </Typography>
        </Box>

        <ToggleButtonGroup
          exclusive
          value={role}
          onChange={(_, selectedRole: UserRole | null) => {
            if (selectedRole && selectedRole !== 'guest') {
              setRole(selectedRole)
            }
          }}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="user">Користувач</ToggleButton>
          <ToggleButton value="admin">Адміністратор</ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={submitLogin}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              required
            />

            {error && <Alert severity="warning">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" endIcon={<LoginIcon />}>
              Увійти як {role === 'admin' ? 'адміністратор' : 'користувач'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage
