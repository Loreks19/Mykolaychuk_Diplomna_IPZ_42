import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { type ReactNode, useState } from 'react'
import type { UserRole } from '../App'

type AppLayoutProps = {
  children: ReactNode
  userRole: UserRole
  onHomeClick: () => void
  onAdminClick: () => void
  onAboutClick: () => void
  onProfileClick: () => void
  onLoginClick: () => void
  onRegisterClick: () => void
  onLogoutClick: () => void
}

function AppLayout({
  children,
  userRole,
  onHomeClick,
  onAdminClick,
  onAboutClick,
  onProfileClick,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
}: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isLoggedIn = userRole !== 'guest'

  const menuItems = [
    { label: 'Ігри', action: onHomeClick, show: true },
    { label: 'Про нас', action: onAboutClick, show: true },
    { label: 'Кабінет', action: onProfileClick, show: isLoggedIn },
    { label: 'Адмін', action: onAdminClick, show: userRole === 'admin' },
    { label: 'Увійти', action: onLoginClick, show: !isLoggedIn },
    { label: 'Реєстрація', action: onRegisterClick, show: !isLoggedIn },
    { label: 'Вийти', action: onLogoutClick, show: isLoggedIn },
  ].filter((item) => item.show)

  const handleMenuClick = (action: () => void) => {
    action()
    setIsMenuOpen(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        background:
          'radial-gradient(circle at top left, rgba(15, 105, 222, 0.22), transparent 34%), #0B1020',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(11, 16, 32, 0.86)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              gap: 2,
              justifyContent: 'space-between',
              minHeight: { xs: 72, md: 84 },
            }}
          >
            <Button
              color="inherit"
              onClick={onHomeClick}
              sx={{
                gap: 1.3,
                px: 0,
                fontSize: { xs: 20, md: 23 },
                '&:hover': { bgcolor: 'transparent', color: 'primary.light' },
              }}
            >
              <Box
                component="img"
                src="/Logo.svg"
                alt="GamletLand logo"
                sx={{
                  width: { xs: 42, md: 50 },
                  height: { xs: 42, md: 50 },
                  filter: 'drop-shadow(0 0 14px rgba(103, 179, 250, 0.45))',
                }}
              />
              GamletLand
            </Button>

            <Box
              component="nav"
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Button color="inherit" onClick={onHomeClick}>
                Ігри
              </Button>
              <Button color="inherit" onClick={onAboutClick}>
                Про нас
              </Button>
              {isLoggedIn && (
                <Button color="inherit" onClick={onProfileClick}>
                  Кабінет
                </Button>
              )}
              {userRole === 'admin' && (
                <Button color="inherit" onClick={onAdminClick}>
                  Адмін
                </Button>
              )}
              {isLoggedIn ? (
                <>
                  <Chip label={userRole === 'admin' ? 'Адміністратор' : 'Користувач'} size="small" color="primary" />
                  <Button variant="outlined" onClick={onLogoutClick}>
                    Вийти
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={onLoginClick}>
                    Увійти
                  </Button>
                  <Button variant="contained" onClick={onRegisterClick}>
                    Реєстрація
                  </Button>
                </>
              )}
            </Box>

            <IconButton
              color="inherit"
              onClick={() => setIsMenuOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              aria-label="Відкрити меню"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              bgcolor: 'background.paper',
              borderLeft: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3">Меню</Typography>
            <IconButton color="inherit" onClick={() => setIsMenuOpen(false)} aria-label="Закрити меню">
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItemButton key={item.label} onClick={() => handleMenuClick(item.action)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main">
        {children}
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3 }}>
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Typography color="text.secondary">GamletLand</Typography>
          <Typography color="text.secondary">Дипломний проєкт з веб-розробки</Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default AppLayout
