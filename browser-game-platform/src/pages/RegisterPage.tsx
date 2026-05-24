import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
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

type RegisterRole = 'user' | 'admin'

type RegisterForm = {
  name: string
  email: string
  password: string
  adminCode: string
}

const defaultForm: RegisterForm = {
  name: '',
  email: '',
  password: '',
  adminCode: '',
}

function RegisterPage() {
  const [role, setRole] = useState<RegisterRole>('user')
  const [form, setForm] = useState(defaultForm)
  const [message, setMessage] = useState('')

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setMessage('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setMessage('Заповни ім’я, email та пароль мінімум з 6 символів.')
      return
    }

    if (role === 'admin' && !form.adminCode.trim()) {
      setMessage('Для реєстрації адміністратора потрібно ввести код доступу.')
      return
    }

    setMessage(
      role === 'admin'
        ? 'Форма адміністратора заповнена. Пізніше ці дані будуть відправлятися в Supabase.'
        : 'Форма користувача заповнена. Пізніше тут буде реальна реєстрація через Supabase.',
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ mb: 3 }}>
          <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
            Account Access
          </Typography>
          <Typography component="h1" variant="h1" sx={{ mb: 1 }}>
            Реєстрація
          </Typography>
          <Typography color="text.secondary">
            Створи обліковий запис для користувача або адміністратора платформи.
          </Typography>
        </Box>

        <ToggleButtonGroup
          exclusive
          value={role}
          onChange={(_, selectedRole: RegisterRole | null) => {
            if (selectedRole) {
              setRole(selectedRole)
              setMessage('')
            }
          }}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="user">
            <PersonAddIcon sx={{ mr: 1 }} />
            Користувач
          </ToggleButton>
          <ToggleButton value="admin">
            <AdminPanelSettingsIcon sx={{ mr: 1 }} />
            Адміністратор
          </ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Ім’я"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Пароль"
              type="password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              fullWidth
              required
              helperText="Мінімум 6 символів"
            />

            {role === 'admin' && (
              <TextField
                label="Код адміністратора"
                value={form.adminCode}
                onChange={(event) => handleChange('adminCode', event.target.value)}
                fullWidth
                required
                helperText="Поки це frontend-поле. Пізніше код буде перевірятися на сервері."
              />
            )}

            {message && (
              <Alert severity={message.includes('Заповни') || message.includes('потрібно') ? 'warning' : 'success'}>
                {message}
              </Alert>
            )}

            <Button type="submit" variant="contained" size="large">
              {role === 'admin' ? 'Зареєструвати адміністратора' : 'Зареєструвати користувача'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegisterPage
