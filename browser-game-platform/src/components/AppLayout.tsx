import CloseIcon from '@mui/icons-material/Close'
import GitHubIcon from '@mui/icons-material/GitHub'
import InstagramIcon from '@mui/icons-material/Instagram'
import MenuIcon from '@mui/icons-material/Menu'
import TelegramIcon from '@mui/icons-material/Telegram'
import YouTubeIcon from '@mui/icons-material/YouTube'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  SvgIcon,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { type ReactNode, useState } from 'react'
import type { UserRole } from '../types/database'

type AppLayoutProps = {
  children: ReactNode
  userRole: UserRole
  userName: string
  avatarUrl: string | null
  onHomeClick: () => void
  onAdminClick: () => void
  onAboutClick: () => void
  onProfileClick: () => void
  onLoginClick: () => void
  onRegisterClick: () => void
  onLogoutClick: () => void
}

function TwitchIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24">
      <path d="M5.2 3 3.8 6.8v11.4h4.1V21h2.8l2.8-2.8h3.4l4.7-4.7V3H5.2Zm14.5 9.6-2.7 2.7h-4.1l-2.8 2.8v-2.8H6.6V4.9h13.1v7.7Zm-3.4-4.9v4.1h-1.9V7.7h1.9Zm-5.1 0v4.1H9.3V7.7h1.9Z" />
    </SvgIcon>
  )
}

function AppLayout({
  children,
  userRole,
  userName,
  avatarUrl,
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
  const avatarLetter = userName.trim()[0]?.toUpperCase() ?? 'G'

  const menuItems = [
    { label: 'Ігри', action: onHomeClick, show: true },
    { label: 'Про нас', action: onAboutClick, show: true },
    { label: 'Кабінет', action: onProfileClick, show: isLoggedIn },
    { label: 'Адмін-панель', action: onAdminClick, show: userRole === 'admin' },
    { label: 'Увійти', action: onLoginClick, show: !isLoggedIn },
    { label: 'Реєстрація', action: onRegisterClick, show: !isLoggedIn },
    { label: 'Вийти', action: onLogoutClick, show: isLoggedIn },
  ].filter((item) => item.show)

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com', icon: <GitHubIcon /> },
    { label: 'Instagram', href: 'https://instagram.com', icon: <InstagramIcon /> },
    { label: 'Telegram', href: 'https://telegram.org', icon: <TelegramIcon /> },
    { label: 'YouTube', href: 'https://youtube.com', icon: <YouTubeIcon /> },
    { label: 'Twitch', href: 'https://twitch.tv', icon: <TwitchIcon /> },
  ]

  const handleMenuClick = (action: () => void) => {
    action()
    setIsMenuOpen(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        background:
          'radial-gradient(circle at top left, rgba(15, 105, 222, 0.24), transparent 32%), radial-gradient(circle at 85% 8%, rgba(103, 179, 250, 0.12), transparent 28%), #0B1020',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(8, 13, 27, 0.76)',
          borderBottom: '1px solid',
          borderColor: 'rgba(159, 219, 240, 0.12)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.18)',
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
                fontFamily: '"Space Grotesk", "Inter", sans-serif',
                fontWeight: 800,
                letterSpacing: 0,
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
                '& .MuiButton-root': {
                  color: 'text.secondary',
                  px: 1.5,
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: 'rgba(103, 179, 250, 0.08)',
                  },
                },
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
                  Адмін-панель
                </Button>
              )}
              {isLoggedIn ? (
                <>
                  <Tooltip title={userRole === 'admin' ? 'Адміністратор' : userName}>
                    <IconButton
                      onClick={onProfileClick}
                      sx={{
                        p: 0.35,
                        border: '1px solid rgba(103, 179, 250, 0.42)',
                        boxShadow: '0 0 22px rgba(15, 105, 222, 0.18)',
                        '&:hover': {
                          borderColor: 'primary.light',
                          bgcolor: 'rgba(103, 179, 250, 0.08)',
                        },
                      }}
                      aria-label="Відкрити профіль"
                    >
                      <Avatar
                        src={avatarUrl ?? undefined}
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: userRole === 'admin' ? '#0F69DE' : 'primary.main',
                          fontSize: 15,
                          fontWeight: 800,
                        }}
                      >
                        {avatarLetter}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
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

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          mt: { xs: 5, md: 7 },
          borderTop: '1px solid',
          borderColor: 'rgba(159, 219, 240, 0.12)',
          background:
            'linear-gradient(180deg, rgba(16, 24, 44, 0.52), rgba(8, 13, 27, 0.96))',
          py: { xs: 2.25, md: 2.5 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              component="img"
              src="/Logo.svg"
              alt="GamletLand logo"
              sx={{ width: 36, height: 36 }}
            />
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", "Inter", sans-serif',
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              GamletLand
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            {socialLinks.map((socialLink) => (
              <IconButton
                key={socialLink.label}
                component="a"
                href={socialLink.href}
                target="_blank"
                rel="noreferrer"
                aria-label={socialLink.label}
                sx={{
                  width: 40,
                  height: 40,
                  color: 'text.secondary',
                  border: '1px solid rgba(159, 219, 240, 0.16)',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  transition: 'transform 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    color: 'primary.light',
                    borderColor: 'rgba(103, 179, 250, 0.58)',
                    bgcolor: 'rgba(103, 179, 250, 0.1)',
                    boxShadow: '0 0 24px rgba(15, 105, 222, 0.24)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {socialLink.icon}
              </IconButton>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default AppLayout
