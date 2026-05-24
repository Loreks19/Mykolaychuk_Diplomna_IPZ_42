import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type AppLayoutProps = {
  children: ReactNode
  onHomeClick: () => void
}

function AppLayout({ children, onHomeClick }: AppLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, justifyContent: 'space-between' }}>
            <Button
              color="inherit"
              onClick={onHomeClick}
              startIcon={<SportsEsportsIcon />}
              sx={{ fontSize: 18 }}
            >
              GameHub
            </Button>

            <Box component="nav" sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={onHomeClick}>
                Ігри
              </Button>
              <Button color="inherit">
                Жанри
              </Button>
              <Button color="inherit">
                Про проєкт
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main">
        {children}
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography color="text.secondary">Browser Game Platform</Typography>
          <Typography color="text.secondary">Дипломний проєкт з веб-розробки</Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default AppLayout
