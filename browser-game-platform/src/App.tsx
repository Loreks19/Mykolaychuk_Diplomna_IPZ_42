import { CssBaseline, ThemeProvider } from '@mui/material'
import { useState } from 'react'
import AppLayout from './components/AppLayout'
import type { Game } from './data/games'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { theme } from './theme'

type AppPage = 'home' | 'register' | 'admin' | 'about' | 'profile' | 'game'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const openHomePage = () => {
    setSelectedGame(null)
    setActivePage('home')
  }

  const openRegisterPage = () => {
    setSelectedGame(null)
    setActivePage('register')
  }

  const openAdminPage = () => {
    setSelectedGame(null)
    setActivePage('admin')
  }

  const openAboutPage = () => {
    setSelectedGame(null)
    setActivePage('about')
  }

  const openProfilePage = () => {
    setSelectedGame(null)
    setActivePage('profile')
  }

  const openGamePage = (game: Game) => {
    setSelectedGame(game)
    setActivePage('game')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        onHomeClick={openHomePage}
        onAdminClick={openAdminPage}
        onAboutClick={openAboutPage}
        onProfileClick={openProfilePage}
        onRegisterClick={openRegisterPage}
      >
        {activePage === 'register' && <RegisterPage />}
        {activePage === 'admin' && <AdminPage />}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'profile' && <ProfilePage onOpenGame={openGamePage} />}
        {activePage === 'game' && selectedGame && (
          <GamePage game={selectedGame} onBack={openHomePage} />
        )}
        {activePage === 'home' && <HomePage onOpenGame={openGamePage} />}
      </AppLayout>
    </ThemeProvider>
  )
}

export default App
