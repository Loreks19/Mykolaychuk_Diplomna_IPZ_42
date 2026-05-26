import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Game } from '../data/games'
import { supabase } from '../services/supabaseClient'
import type { CommentRow, GameRow, GenreRow, UserRole } from '../types/database'

type AdminTab = 'games' | 'genres' | 'comments'

type EditableGame = Game & {
  genreId: number | null
}

type AdminComment = CommentRow & {
  gameTitle: string
}

type AdminGameForm = {
  title: string
  genreId: string
  description: string
  players: string
  difficulty: string
  coverImage: string
  rating: string
  playUrl: string
}

type AdminPageProps = {
  userRole: UserRole
  onCatalogChange: () => void | Promise<void>
}

type GameUploadResponse = {
  play_url?: string
  error?: string
}

const emptyForm: AdminGameForm = {
  title: '',
  genreId: '',
  description: '',
  players: '1 гравець',
  difficulty: 'Легка',
  coverImage: '',
  rating: '4.0',
  playUrl: '',
}

const gameAdminPanelHeight = { lg: 740 }

const createSlug = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
    .replace(/\s+/g, '-')

const gameUploadWorkerUrl = import.meta.env.VITE_GAME_UPLOAD_WORKER_URL as string | undefined

function AdminPage({ userRole, onCatalogChange }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('games')
  const [gameList, setGameList] = useState<EditableGame[]>([])
  const [genreList, setGenreList] = useState<GenreRow[]>([])
  const [comments, setComments] = useState<AdminComment[]>([])
  const [form, setForm] = useState<AdminGameForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newGenreName, setNewGenreName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCoverUploading, setIsCoverUploading] = useState(false)
  const [isGameUploading, setIsGameUploading] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [gameZipFile, setGameZipFile] = useState<File | null>(null)

  const gameTitleById = useMemo(
    () => new Map(gameList.map((game) => [game.id, game.title])),
    [gameList],
  )

  const loadAdminData = useCallback(async () => {
    if (userRole !== 'admin') {
      return
    }

    setIsLoading(true)
    setMessage('')

    const [
      { data: genreData, error: genreError },
      { data: gameData, error: gameError },
      { data: commentData, error: commentError },
    ] = await Promise.all([
      supabase
        .from('genres')
        .select('id, name, created_at')
        .order('name', { ascending: true }),
      supabase
        .from('games')
        .select('id, title, slug, genre_id, description, players, difficulty, cover_image, play_url, rating, created_at')
        .order('id', { ascending: true }),
      supabase
        .from('comments')
        .select('id, game_id, user_id, author_name, author_role, author_avatar_url, text, created_at')
        .order('created_at', { ascending: false }),
    ])

    if (genreError || gameError || commentError) {
      setMessage(genreError?.message ?? gameError?.message ?? commentError?.message ?? 'Не вдалося завантажити дані.')
      setIsLoading(false)
      return
    }

    const nextGenres = (genreData ?? []) as GenreRow[]
    const genreById = new Map(nextGenres.map((genre) => [genre.id, genre.name]))
    const nextGames = ((gameData ?? []) as GameRow[]).map((game) => ({
      id: game.id,
      title: game.title,
      slug: game.slug,
      genreId: game.genre_id,
      genre: (game.genre_id ? genreById.get(game.genre_id) : undefined) ?? 'Без жанру',
      description: game.description,
      players: game.players,
      difficulty: game.difficulty,
      coverImage: game.cover_image,
      rating: game.rating,
      playUrl: game.play_url ?? undefined,
    }))
    const nextGameTitleById = new Map(nextGames.map((game) => [game.id, game.title]))

    setGenreList(nextGenres)
    setGameList(nextGames)
    setComments(((commentData ?? []) as CommentRow[]).map((comment) => ({
      ...comment,
      gameTitle: nextGameTitleById.get(comment.game_id) ?? `Гра #${comment.game_id}`,
    })))
    setIsLoading(false)
  }, [userRole])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdminData()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadAdminData])

  const updateField = (field: keyof AdminGameForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setMessage('')
  }

  const startEdit = (game: EditableGame) => {
    setEditingId(game.id)
    setCoverFile(null)
    setCoverPreviewUrl(null)
    setGameZipFile(null)
    setForm({
      title: game.title,
      genreId: game.genreId ? String(game.genreId) : '',
      description: game.description,
      players: game.players,
      difficulty: game.difficulty,
      coverImage: game.coverImage,
      rating: String(game.rating),
      playUrl: game.playUrl ?? '',
    })
    setActiveTab('games')
    setMessage('')
  }

  const clearForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setCoverFile(null)
    setCoverPreviewUrl(null)
    setGameZipFile(null)
    setMessage('')
  }

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  const startCreate = () => {
    clearForm()
    setActiveTab('games')
    setMessage('Заповни форму та натисни "Додати гру".')
  }

  const uploadCoverImage = async (gameId: number, title: string, file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const slug = createSlug(title) || `game-${gameId}`
    const filePath = `${gameId}/${slug}-${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('game-covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage.from('game-covers').getPublicUrl(filePath)
    return data.publicUrl
  }

  const uploadGameArchive = async (gameId: number, title: string, file: File) => {
    if (!gameUploadWorkerUrl) {
      throw new Error('VITE_GAME_UPLOAD_WORKER_URL is missing in .env.')
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    if (sessionError || !accessToken) {
      throw new Error(sessionError?.message ?? 'Admin session was not found.')
    }

    const formData = new FormData()
    formData.append('slug', createSlug(title) || `game-${gameId}`)
    formData.append('file', file)

    const response = await fetch(gameUploadWorkerUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
    const responseBody = await response.json().catch(() => ({} as GameUploadResponse)) as GameUploadResponse

    if (!response.ok) {
      throw new Error(responseBody.error ?? `Worker upload failed with status ${response.status}.`)
    }

    if (!responseBody.play_url) {
      throw new Error('Worker did not return play_url.')
    }

    return responseBody.play_url
  }

  const saveGame = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.genreId) {
      setMessage('Заповни назву, жанр та опис гри.')
      return
    }

    if (!editingId && !coverFile) {
      setMessage('Для нової гри додай заставку з ПК.')
      return
    }

    const rating = Number(form.rating)
    const slug = createSlug(form.title)

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      setMessage('Рейтинг має бути числом від 0 до 5.')
      return
    }

    if (!slug) {
      setMessage('Назва гри має містити хоча б одну літеру або цифру для створення адреси гри.')
      return
    }

    const gamePayload = {
      title: form.title.trim(),
      slug,
      genre_id: Number(form.genreId),
      description: form.description.trim(),
      players: form.players.trim() || '1 гравець',
      difficulty: form.difficulty.trim() || 'Легка',
      cover_image: form.coverImage.trim() || '/games_images/shooter.png',
      play_url: form.playUrl.trim() || null,
      rating,
    }

    setIsCoverUploading(Boolean(coverFile))
    setIsGameUploading(Boolean(gameZipFile))

    if (editingId) {
      const { error } = await supabase
        .from('games')
        .update(gamePayload)
        .eq('id', editingId)

      if (error) {
        setIsCoverUploading(false)
        setIsGameUploading(false)
        setMessage(`Не вдалося зберегти гру: ${error.message}`)
        return
      }

      if (coverFile) {
        try {
          const coverUrl = await uploadCoverImage(editingId, form.title, coverFile)
          const { error: coverError } = await supabase
            .from('games')
            .update({ cover_image: coverUrl })
            .eq('id', editingId)

          if (coverError) {
            setMessage(`Заставку завантажено, але не вдалося оновити гру: ${coverError.message}`)
            setIsCoverUploading(false)
            setIsGameUploading(false)
            return
          }
        } catch (error) {
          setIsCoverUploading(false)
          setIsGameUploading(false)
          setMessage(`Не вдалося завантажити заставку: ${error instanceof Error ? error.message : 'невідома помилка'}`)
          return
        }
      }

      if (gameZipFile) {
        try {
          const playUrl = await uploadGameArchive(editingId, form.title, gameZipFile)
          const { error: gameFilesError } = await supabase
            .from('games')
            .update({ play_url: playUrl })
            .eq('id', editingId)

          if (gameFilesError) {
            setMessage(`Архів гри завантажено, але не вдалося оновити шлях запуску: ${gameFilesError.message}`)
            setIsCoverUploading(false)
            setIsGameUploading(false)
            return
          }
        } catch (error) {
          setIsCoverUploading(false)
          setIsGameUploading(false)
          setMessage(`Не вдалося завантажити архів гри: ${error instanceof Error ? error.message : 'невідома помилка'}`)
          return
        }
      }

      setMessage('Гру оновлено.')
      setIsCoverUploading(false)
      setIsGameUploading(false)
      clearForm()
      await loadAdminData()
      await onCatalogChange()
      return
    }

    const { data, error } = await supabase
      .from('games')
      .insert(gamePayload)
      .select('id')
      .single<Pick<GameRow, 'id'>>()

    if (error || !data) {
      setIsCoverUploading(false)
      setIsGameUploading(false)
      setMessage(`Не вдалося додати гру: ${error?.message ?? 'гра не створена'}`)
      return
    }

    if (coverFile) {
      try {
        const coverUrl = await uploadCoverImage(data.id, form.title, coverFile)
        const { error: coverError } = await supabase
          .from('games')
          .update({ cover_image: coverUrl })
          .eq('id', data.id)

        if (coverError) {
          setMessage(`Гру додано, але не вдалося зберегти заставку: ${coverError.message}`)
          setIsCoverUploading(false)
          setIsGameUploading(false)
          return
        }
      } catch (error) {
        setMessage(`Гру додано, але не вдалося завантажити заставку: ${error instanceof Error ? error.message : 'невідома помилка'}`)
        setIsCoverUploading(false)
        setIsGameUploading(false)
        return
      }
    }

    if (gameZipFile) {
      try {
        const playUrl = await uploadGameArchive(data.id, form.title, gameZipFile)
        const { error: gameFilesError } = await supabase
          .from('games')
          .update({ play_url: playUrl })
          .eq('id', data.id)

        if (gameFilesError) {
          setMessage(`Гру додано, але не вдалося зберегти шлях запуску: ${gameFilesError.message}`)
          setIsCoverUploading(false)
          setIsGameUploading(false)
          return
        }
      } catch (error) {
        setMessage(`Гру додано, але не вдалося завантажити архів гри: ${error instanceof Error ? error.message : 'невідома помилка'}`)
        setIsCoverUploading(false)
        setIsGameUploading(false)
        return
      }
    }

    setMessage('Гру додано.')
    setIsCoverUploading(false)
    setIsGameUploading(false)
    clearForm()
    await loadAdminData()
    await onCatalogChange()
  }

  const addGenre = async () => {
    const name = newGenreName.trim()

    if (!name) {
      setMessage('Введи назву жанру.')
      return
    }

    const { error } = await supabase.from('genres').insert({ name })

    if (error) {
      setMessage(`Не вдалося додати жанр: ${error.message}`)
      return
    }

    setNewGenreName('')
    setMessage('Жанр додано.')
    await loadAdminData()
    await onCatalogChange()
  }

  const deleteComment = async (commentId: number) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)

    if (error) {
      setMessage(`Не вдалося видалити коментар: ${error.message}`)
      return
    }

    setComments((currentComments) => currentComments.filter((comment) => comment.id !== commentId))
    setMessage('Коментар видалено.')
  }

  const deleteGenre = async (genreId: number) => {
    const { error } = await supabase.from('genres').delete().eq('id', genreId)

    if (error) {
      setMessage(`Не вдалося видалити жанр: ${error.message}`)
      return
    }

    setMessage('Жанр видалено.')
    await loadAdminData()
    await onCatalogChange()
  }

  const deleteGame = async (game: EditableGame) => {
    const isConfirmed = window.confirm(`Видалити гру "${game.title}"? Коментарі, оцінки та обране для цієї гри також буде видалено.`)

    if (!isConfirmed) {
      return
    }

    const { error } = await supabase.from('games').delete().eq('id', game.id)

    if (error) {
      setMessage(`Не вдалося видалити гру: ${error.message}`)
      return
    }

    if (editingId === game.id) {
      clearForm()
    }

    setMessage('Гру видалено.')
    await loadAdminData()
    await onCatalogChange()
  }

  if (userRole !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="warning">
          Для доступу до адмін-панелі потрібно увійти під акаунтом із роллю admin.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
          Admin Panel
        </Typography>
        <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
          Керування платформою
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: 18 }}>
          Адмін може модерувати коментарі, додавати жанри та редагувати ігри, які вже є в каталозі.
        </Typography>
      </Box>

      {message && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Paper sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, value: AdminTab) => setActiveTab(value)} variant="scrollable">
          <Tab label="Ігри" value="games" />
          <Tab label="Жанри" value="genres" />
          <Tab label="Коментарі" value="comments" />
        </Tabs>
      </Paper>

      {isLoading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Завантаження адмін-даних...
        </Typography>
      )}

      {activeTab === 'games' && (
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
          <Paper
            sx={{
              width: { xs: '100%', lg: 400 },
              height: gameAdminPanelHeight,
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Typography variant="h2" sx={{ mb: 2 }}>
              {editingId ? 'Редагувати гру' : 'Додати гру'}
            </Typography>

            <Stack
              spacing={2}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                pr: { lg: 1 },
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(103, 179, 250, 0.75) rgba(255, 255, 255, 0.08)',
                '&::-webkit-scrollbar': { width: 10 },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 999,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(103, 179, 250, 0.75)',
                  borderRadius: 999,
                  border: '2px solid rgba(255, 255, 255, 0.08)',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  bgcolor: 'primary.light',
                },
              }}
            >
              <TextField label="Назва гри" value={form.title} onChange={(event) => updateField('title', event.target.value)} fullWidth />
              <TextField select label="Жанр" value={form.genreId} onChange={(event) => updateField('genreId', event.target.value)} fullWidth>
                {genreList.map((genre) => (
                  <MenuItem key={genre.id} value={String(genre.id)}>{genre.name}</MenuItem>
                ))}
              </TextField>
              <TextField label="Опис" value={form.description} onChange={(event) => updateField('description', event.target.value)} multiline minRows={3} fullWidth />
              <TextField label="Кількість гравців" value={form.players} onChange={(event) => updateField('players', event.target.value)} fullWidth />
              <TextField label="Складність" value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)} fullWidth />
              <TextField label="Рейтинг" value={form.rating} onChange={(event) => updateField('rating', event.target.value)} fullWidth />
              <Stack spacing={1}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  disabled={isCoverUploading}
                  size="large"
                  fullWidth
                  sx={{ minHeight: 40 }}
                >
                  {coverFile ? coverFile.name : 'Обрати заставку з ПК'}
                  <Box
                    component="input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0]

                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          setMessage('Обери файл зображення.')
                        } else if (file.size > 4 * 1024 * 1024) {
                          setMessage('Зображення має бути до 4 MB.')
                        } else {
                          setCoverFile(file)
                          setCoverPreviewUrl(URL.createObjectURL(file))
                          setMessage('Заставку обрано. Натисни "Зберегти", щоб завантажити її.')
                        }
                      }

                      event.target.value = ''
                    }}
                  />
                </Button>
                {(coverPreviewUrl || form.coverImage) && (
                  <Box
                    component="img"
                    src={coverPreviewUrl ?? form.coverImage}
                    alt="Попередній перегляд заставки"
                    sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                  />
                )}
              </Stack>
              <Stack spacing={1}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  disabled={isGameUploading}
                  size="large"
                  fullWidth
                  sx={{ minHeight: 46 }}
                >
                  {gameZipFile ? gameZipFile.name : 'Обрати ZIP гри з ПК'}
                  <Box
                    component="input"
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0]

                      if (file) {
                        if (!file.name.toLowerCase().endsWith('.zip')) {
                          setMessage('Обери ZIP-архів гри.')
                        } else if (file.size > 50 * 1024 * 1024) {
                          setMessage('Архів гри має бути до 50 MB.')
                        } else {
                          setGameZipFile(file)
                          setMessage('ZIP гри обрано. Натисни кнопку збереження, щоб завантажити файли гри.')
                        }
                      }

                      event.target.value = ''
                    }}
                  />
                </Button>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={saveGame} sx={{ flex: 1 }}>
                  {isCoverUploading || isGameUploading ? 'Збереження...' : editingId ? 'Зберегти' : 'Додати гру'}
                </Button>
                <Button variant="outlined" size="large" onClick={clearForm} sx={{ flex: 1 }}>Очистити</Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              width: '100%',
              height: gameAdminPanelHeight,
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2, flexShrink: 0 }}
            >
              <Typography variant="h2">Список ігор</Typography>
              <Button variant="contained" onClick={startCreate}>Додати нову гру</Button>
            </Stack>
            <Stack
              spacing={2}
              sx={{
                flex: 1,
                minHeight: 0,
                pr: { lg: 1 },
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(103, 179, 250, 0.75) rgba(255, 255, 255, 0.08)',
                '&::-webkit-scrollbar': { width: 10 },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 999,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(103, 179, 250, 0.75)',
                  borderRadius: 999,
                  border: '2px solid rgba(255, 255, 255, 0.08)',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  bgcolor: 'primary.light',
                },
              }}
            >
              {gameList.map((game) => (
                <Box key={game.id}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                    <Box component="img" src={game.coverImage} alt={game.title} sx={{ width: { xs: '100%', md: 160 }, height: 92, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1, flexWrap: 'wrap' }}>
                        <Chip label={game.genre} color="primary" size="small" />
                        <Chip label={game.difficulty} variant="outlined" size="small" />
                        <Chip label={game.rating.toFixed(1)} variant="outlined" size="small" />
                        {!game.playUrl && <Chip label="Без запуску" color="warning" variant="outlined" size="small" />}
                      </Stack>
                      <Typography variant="h3">{game.title}</Typography>
                      <Typography color="text.secondary">{game.description}</Typography>
                    </Box>
                    <Stack direction={{ xs: 'row', md: 'column' }} spacing={1} sx={{ alignItems: 'stretch' }}>
                      <Button variant="outlined" startIcon={<EditIcon />} onClick={() => startEdit(game)}>
                        Редагувати
                      </Button>
                      <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => deleteGame(game)}>
                        Видалити
                      </Button>
                    </Stack>
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}

      {activeTab === 'genres' && (
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>Жанри</Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              label="Новий жанр"
              value={newGenreName}
              onChange={(event) => {
                setNewGenreName(event.target.value)
                setMessage('')
              }}
              fullWidth
            />
            <Button variant="contained" onClick={addGenre} sx={{ minWidth: 160 }}>
              Додати
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {genreList.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
                color="primary"
                onDelete={() => deleteGenre(genre.id)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {activeTab === 'comments' && (
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>Модерація коментарів</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Тут відображаються всі коментарі з усіх ігор. Видалення прибирає коментар із Supabase.
          </Typography>

          <Stack spacing={2}>
            {comments.map((comment) => (
              <Box key={comment.id}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-start' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={gameTitleById.get(comment.game_id) ?? comment.gameTitle} color="primary" size="small" />
                      <Chip label={comment.author_name} variant="outlined" size="small" />
                      <Chip label={new Date(comment.created_at).toLocaleDateString('uk-UA')} variant="outlined" size="small" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {comment.text}
                    </Typography>
                  </Box>
                  <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => deleteComment(comment.id)}>
                    Видалити
                  </Button>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Stack>

          {!isLoading && comments.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              Коментарів поки немає.
            </Typography>
          )}
        </Paper>
      )}
    </Container>
  )
}

export default AdminPage
