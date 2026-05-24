import { CssBaseline, ThemeProvider } from '@mui/material'
import { useState } from 'react'
import AppLayout from './components/AppLayout'
import { games, type Game } from './data/games'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { theme } from './theme'

type AppPage = 'home' | 'register' | 'login' | 'admin' | 'about' | 'profile' | 'game'
export type UserRole = 'guest' | 'user' | 'admin'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('guest')
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1, 2])

  const openPage = (page: AppPage) => {
    setSelectedGame(null)
    setActivePage(page)
  }

  const openGamePage = (game: Game) => {
    setSelectedGame(game)
    setActivePage('game')
  }

  const toggleFavorite = (gameId: number) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(gameId)
        ? currentIds.filter((id) => id !== gameId)
        : [...currentIds, gameId],
    )
  }

  const login = (role: UserRole) => {
    setUserRole(role)
    openPage(role === 'admin' ? 'admin' : 'profile')
  }

  const logout = () => {
    setUserRole('guest')
    openPage('home')
  }

  const favoriteGames = games.filter((game) => favoriteIds.includes(game.id))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        userRole={userRole}
        onHomeClick={() => openPage('home')}
        onAdminClick={() => openPage('admin')}
        onAboutClick={() => openPage('about')}
        onProfileClick={() => openPage('profile')}
        onLoginClick={() => openPage('login')}
        onRegisterClick={() => openPage('register')}
        onLogoutClick={logout}
      >
        {activePage === 'register' && <RegisterPage />}
        {activePage === 'login' && <LoginPage onLogin={login} />}
        {activePage === 'admin' && <AdminPage />}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'profile' && (
          <ProfilePage
            favoriteGames={favoriteGames}
            onOpenGame={openGamePage}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activePage === 'game' && selectedGame && (
          <GamePage
            game={selectedGame}
            isFavorite={favoriteIds.includes(selectedGame.id)}
            onBack={() => openPage('home')}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activePage === 'home' && (
          <HomePage
            favoriteIds={favoriteIds}
            onOpenGame={openGamePage}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AppLayout>
    </ThemeProvider>
  )
}

export default App
