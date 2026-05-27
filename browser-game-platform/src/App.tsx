import { CssBaseline, ThemeProvider } from '@mui/material'
import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout'
import { games as fallbackGames, genres as fallbackGenres, type Game, type GameGenre } from './data/games'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { supabase } from './services/supabaseClient'
import { theme } from './theme'
import type { GameRow, GenreRow, Profile, UserRole } from './types/database'

type AppPage = 'home' | 'register' | 'login' | 'admin' | 'about' | 'profile' | 'game'
type LoginMode = 'user' | 'admin'

const pageFromHash = (hash: string): AppPage => {
  const cleanHash = hash.replace(/^#/, '')

  if (cleanHash.startsWith('game/')) {
    return 'game'
  }

  if (['register', 'login', 'admin', 'about', 'profile'].includes(cleanHash)) {
    return cleanHash as AppPage
  }

  return 'home'
}

const gameSlugFromHash = (hash: string) => {
  const cleanHash = hash.replace(/^#/, '')
  return cleanHash.startsWith('game/') ? cleanHash.slice(5) : null
}

function App() {
  const initialGameSlug = gameSlugFromHash(window.location.hash)
  const [activePage, setActivePage] = useState<AppPage>(() => pageFromHash(window.location.hash))
  const [selectedGame, setSelectedGame] = useState<Game | null>(() =>
    initialGameSlug ? fallbackGames.find((game) => game.slug === initialGameSlug) ?? null : null,
  )
  const [userRole, setUserRole] = useState<UserRole>('guest')
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('Гравець')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false)
  const [games, setGames] = useState<Game[]>(fallbackGames)
  const [genres, setGenres] = useState<GameGenre[]>(fallbackGenres)

  const openPage = (page: AppPage) => {
    setSelectedGame(null)
    setActivePage(page)
    window.location.hash = page === 'home' ? 'home' : page
  }

  const openGamePage = (game: Game) => {
    setSelectedGame(game)
    setActivePage('game')
    window.location.hash = `game/${game.slug}`
  }

  const loadUserProfile = async (userId: string) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', userId)
        .single<Pick<Profile, 'full_name' | 'role' | 'avatar_url'>>()

      if (!error && data) {
        setUserRole(data.role)
        setUserName(data.full_name)
        setAvatarUrl(data.avatar_url)
        return data.role
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 400)
      })
    }

    setUserRole('user')
    return 'user'
  }

  const loadCatalog = async () => {
    const [
      { data: genreData, error: genreError },
      { data: gameData, error: gameError },
    ] = await Promise.all([
      supabase
        .from('genres')
        .select('id, name, created_at')
        .order('name', { ascending: true }),
      supabase
        .from('games')
        .select('id, title, slug, genre_id, description, players, difficulty, cover_image, play_url, rating, created_at')
        .order('id', { ascending: true }),
    ])

    if (genreError || gameError) {
      console.error('Catalog load error:', genreError?.message ?? gameError?.message)
      return
    }

    const nextGenres = (genreData ?? []) as GenreRow[]
    const nextGames = (gameData ?? []) as GameRow[]
    const genreById = new Map(nextGenres.map((genre) => [genre.id, genre.name]))

    setGenres(nextGenres.map((genre) => genre.name))

    const mappedGames = nextGames.map((game) => ({
      id: game.id,
      title: game.title,
      slug: game.slug,
      genre: (game.genre_id ? genreById.get(game.genre_id) : undefined) ?? 'Без жанру',
      description: game.description,
      players: game.players,
      difficulty: game.difficulty,
      coverImage: game.cover_image,
      rating: game.rating,
      playUrl: game.play_url ?? undefined,
    }))

    setGames(mappedGames)

    const hashedGameSlug = gameSlugFromHash(window.location.hash)

    if (hashedGameSlug) {
      const hashedGame = mappedGames.find((game) => game.slug === hashedGameSlug)

      if (hashedGame) {
        setSelectedGame(hashedGame)
        setActivePage('game')
      } else {
        setSelectedGame(null)
        setActivePage('home')
      }
    }
  }

  const loadFavorites = async (currentUserId: string) => {
    setIsFavoritesLoading(true)

    const { data } = await supabase
      .from('favorites')
      .select('game_id')
      .eq('user_id', currentUserId)

    setFavoriteIds((data ?? []).map((favorite) => favorite.game_id))
    setIsFavoritesLoading(false)
  }

  useEffect(() => {
    const catalogTimer = window.setTimeout(() => {
      void loadCatalog()
    }, 0)

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
        setAvatarUrl(null)
        setFavoriteIds([])
        setIsFavoritesLoading(false)
      }
    })

    return () => {
      window.clearTimeout(catalogTimer)
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = pageFromHash(window.location.hash)
      const nextGameSlug = gameSlugFromHash(window.location.hash)

      if (nextPage === 'game' && nextGameSlug) {
        const nextGame = games.find((game) => game.slug === nextGameSlug)
        setSelectedGame(nextGame ?? null)
        setActivePage(nextGame ? 'game' : 'home')
        return
      }

      setSelectedGame(null)
      setActivePage(nextPage)
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [games])

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

  const clearCurrentUser = () => {
    setUserId(null)
    setUserRole('guest')
    setUserName('Гравець')
    setAvatarUrl(null)
    setFavoriteIds([])
    setIsFavoritesLoading(false)
  }

  const login = async (mode: LoginMode = 'user') => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      return 'Не вдалося знайти активну сесію.'
    }

    const nextRole = await loadUserProfile(data.user.id)

    if (mode === 'user' && nextRole === 'admin') {
      await supabase.auth.signOut()
      clearCurrentUser()
      return 'Цей акаунт має роль адміністратора. Обери режим "Адмін" для входу.'
    }

    if (mode === 'admin' && nextRole !== 'admin') {
      await supabase.auth.signOut()
      clearCurrentUser()
      return 'Цей акаунт не має прав адміністратора.'
    }

    setUserId(data.user.id)
    await loadFavorites(data.user.id)
    openPage(nextRole === 'admin' ? 'admin' : 'profile')
    return true
  }

  const logout = async () => {
    await supabase.auth.signOut()
    clearCurrentUser()
    openPage('home')
  }

  const updateProfileAvatar = async (nextAvatarUrl: string | null) => {
    if (!userId) {
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: nextAvatarUrl })
      .eq('id', userId)

    if (error) {
      console.error('Avatar update error:', error.message)
      return false
    }

    setAvatarUrl(nextAvatarUrl)
    return true
  }

  const updateProfileName = async (nextUserName: string) => {
    if (!userId) {
      return false
    }

    const trimmedName = nextUserName.trim()

    if (!trimmedName) {
      return false
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: trimmedName })
      .eq('id', userId)

    if (error) {
      console.error('Profile name update error:', error.message)
      return false
    }

    setUserName(trimmedName)
    return true
  }

  const favoriteGames = games.filter((game) => favoriteIds.includes(game.id))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        userRole={userRole}
        userName={userName}
        avatarUrl={avatarUrl}
        onHomeClick={() => openPage('home')}
        onAdminClick={() => openPage('admin')}
        onAboutClick={() => openPage('about')}
        onProfileClick={() => openPage('profile')}
        onLoginClick={() => openPage('login')}
        onRegisterClick={() => openPage('register')}
        onLogoutClick={logout}
      >
        {activePage === 'register' && <RegisterPage onRegisterSuccess={login} />}
        {activePage === 'login' && <LoginPage onLogin={login} />}
        {activePage === 'admin' && (
          <AdminPage
            userRole={userRole}
            onCatalogChange={loadCatalog}
          />
        )}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'profile' && (
          <ProfilePage
            userId={userId}
            userName={userName}
            avatarUrl={avatarUrl}
            favoriteGames={favoriteGames}
            isFavoritesLoading={isFavoritesLoading}
            onOpenGame={openGamePage}
            onToggleFavorite={toggleFavorite}
            onAvatarUpdate={updateProfileAvatar}
            onNameUpdate={updateProfileName}
          />
        )}
        {activePage === 'game' && selectedGame && (
          <GamePage
            game={selectedGame}
            userId={userId}
            userName={userName}
            userRole={userRole}
            avatarUrl={avatarUrl}
            isFavorite={favoriteIds.includes(selectedGame.id)}
            onBack={() => openPage('home')}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activePage === 'home' && (
          <HomePage
            games={games}
            genres={genres}
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
