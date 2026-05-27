import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'

type AdminPageHeaderProps = {
  onRefresh: () => void | Promise<void>
}

function AdminPageHeader({ onRefresh }: AdminPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ mb: 4, justifyContent: 'space-between', alignItems: { md: 'flex-end' } }}
    >
      <Box>
        <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
          Керування платформою
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: 18 }}>
          Адмін може модерувати коментарі, додавати жанри та редагувати ігри, які вже є в каталозі.
        </Typography>
      </Box>

      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
        Оновити дані
      </Button>
    </Stack>
  )
}

export default AdminPageHeader
