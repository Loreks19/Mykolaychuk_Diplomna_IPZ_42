import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { supabase } from '../services/supabaseClient'

type RegisterForm = {
  name: string
  email: string
  password: string
}

type RegisterPageProps = {
  onRegisterSuccess: () => void
}

const defaultForm: RegisterForm = {
  name: '',
  email: '',
  password: '',
}

function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  const [form, setForm] = useState(defaultForm)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setMessage('Заповни ім’я, email та пароль мінімум з 6 символів.')
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          role: 'user',
        },
      },
    })

    setIsLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data.session) {
      setMessage('Акаунт створено. Перевір email для підтвердження реєстрації.')
      return
    }

    onRegisterSuccess()
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ mb: 3 }}>
          <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
            Account Access
          </Typography>
          <Typography component="h1" variant="h1" sx={{ mb: 1 }}>
            Реєстрація користувача
          </Typography>
          <Typography color="text.secondary">
            Адміністратор входить окремо через готовий демо-логін. Тут створюється тільки звичайний користувач.
          </Typography>
        </Box>

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

            {message && <Alert severity={message.includes('створено') ? 'success' : 'warning'}>{message}</Alert>}

            <Button type="submit" variant="contained" size="large" startIcon={<PersonAddIcon />} disabled={isLoading}>
              {isLoading ? 'Створення акаунта...' : 'Зареєструвати користувача'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegisterPage
