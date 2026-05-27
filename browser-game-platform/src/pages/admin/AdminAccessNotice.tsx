import { Alert, Container } from '@mui/material'

function AdminAccessNotice() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Alert severity="warning">
        Для доступу до адмін-панелі потрібно увійти під акаунтом із роллю admin.
      </Alert>
    </Container>
  )
}

export default AdminAccessNotice
