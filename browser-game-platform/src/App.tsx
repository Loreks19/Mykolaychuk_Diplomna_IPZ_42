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
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('Гравець')
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  const openPage = (page: AppPage) => {
    setSelectedGame(null)
    setActivePage(page)
  }

  const openGamePage = (game: Game) => {
    setSelectedGame(game)
    setActivePage('game')
  }

  const loadUserProfile = async (userId: string) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single<Pick<Profile, 'full_name'>>()

      if (!error && data) {
        setUserRole('user')
        setUserName(data.full_name)
        return
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 400)
      })
    }

    setUserRole('user')
  }

  const loadFavorites = async (currentUserId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('game_id')
      .eq('user_id', currentUserId)

    setFavoriteIds((data ?? []).map((favorite) => favorite.game_id))
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        void loadUserProfile(data.user.id)
        void loadFavorites(data.user.id)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        void loadUserProfile(session.user.id)
        void loadFavorites(session.user.id)
      } else {
        setUserId(null)
        setUserRole('guest')
        setUserName('Гравець')
        setFavoriteIds([])
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const toggleFavorite = async (gameId: number) => {
    if (!userId) {
      return false
    }

    if (favoriteIds.includes(gameId)) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', gameId)

      if (error) {
        console.error('Favorite delete error:', error.message)
        return false
      }

      setFavoriteIds((currentIds) => currentIds.filter((id) => id !== gameId))
      return true
    }

    const { error } = await supabase
      .from('favorites')
      .upsert({
        user_id: userId,
        game_id: gameId,
      }, { onConflict: 'game_id,user_id' })

    if (error) {
      console.error('Favorite save error:', error.message)
      return false
    }

    setFavoriteIds((currentIds) => [...currentIds, gameId])
    return true
  }

  const login = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      return
    }

    await loadUserProfile(data.user.id)
    setUserId(data.user.id)
    await loadFavorites(data.user.id)
    openPage('profile')
  }

  const loginAsAdmin = async () => {
    await supabase.auth.signOut()
    setUserId(null)
    setUserRole('admin')
    setUserName('Адміністратор')
    setFavoriteIds([])
    openPage('admin')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUserId(null)
    setUserRole('guest')
    setUserName('Гравець')
    setFavoriteIds([])
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
            userName={userName}
            favoriteGames={favoriteGames}
            onOpenGame={openGamePage}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activePage === 'game' && selectedGame && (
          <GamePage
            game={selectedGame}
            userId={userId}
            userName={userName}
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
