import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LoginIcon from '@mui/icons-material/Login'
import PersonIcon from '@mui/icons-material/Person'
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { type FormEvent, useState } from 'react'
import { supabase } from '../services/supabaseClient'

type LoginMode = 'user' | 'admin'

type LoginPageProps = {
  onLogin: (mode: LoginMode) => Promise<boolean | string>
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<LoginMode>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!email.trim() || password.length < 6) {
      setMessage('Введи email та пароль мінімум з 6 символів.')
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    const loginResult = await onLogin(mode)

    if (loginResult !== true) {
      setMessage(typeof loginResult === 'string' ? loginResult : 'Не вдалося увійти.')
    }
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
            Обери тип входу: звичайний користувач не потрапляє в адмінку, а адмін входить тільки через режим адміністратора.
          </Typography>
        </Box>

        <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(_, selectedMode: LoginMode | null) => {
            if (selectedMode) {
              setMode(selectedMode)
              setMessage('')
            }
          }}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="user">
            <PersonIcon sx={{ mr: 1 }} />
            Користувач
          </ToggleButton>
          <ToggleButton value="admin">
            <AdminPanelSettingsIcon sx={{ mr: 1 }} />
            Адмін
          </ToggleButton>
        </ToggleButtonGroup>

        {mode === 'admin' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Для входу в адмінку акаунт має мати роль admin у таблиці profiles.
          </Alert>
        )}

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

            {message && <Alert severity="warning">{message}</Alert>}

            <Button type="submit" variant="contained" size="large" endIcon={<LoginIcon />} disabled={isLoading}>
              {isLoading ? 'Вхід...' : mode === 'admin' ? 'Увійти в адмінку' : 'Увійти як користувач'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage
