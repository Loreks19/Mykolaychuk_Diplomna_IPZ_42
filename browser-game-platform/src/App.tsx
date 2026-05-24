import { CssBaseline, ThemeProvider } from '@mui/material'
import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout'
import { games, type Game } from './data/games'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { supabase } from './services/supabaseClient'
import { theme } from './theme'
import type { Profile, UserRole } from './types/database'

type AppPage = 'home' | 'register' | 'login' | 'admin' | 'about' | 'profile' | 'game'

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

  const loadUserRole = async (userId: string) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single<Pick<Profile, 'role'>>()

      if (!error && data) {
        setUserRole(data.role)
        return data.role
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 400)
      })
    }

    setUserRole('user')
    return 'user'
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        void loadUserRole(data.user.id)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        void loadUserRole(session.user.id)
      } else {
        setUserRole('guest')
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const toggleFavorite = (gameId: number) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(gameId)
        ? currentIds.filter((id) => id !== gameId)
        : [...currentIds, gameId],
    )
  }

  const login = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      return
    }

    const role = await loadUserRole(data.user.id)
    openPage(role === 'admin' ? 'admin' : 'profile')
  }

  const loginAsAdmin = async () => {
    await supabase.auth.signOut()
    setUserRole('admin')
    openPage('admin')
  }

  const logout = async () => {
    await supabase.auth.signOut()
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
        {activePage === 'register' && <RegisterPage onRegisterSuccess={login} />}
        {activePage === 'login' && <LoginPage onLogin={login} onAdminLogin={loginAsAdmin} />}
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
