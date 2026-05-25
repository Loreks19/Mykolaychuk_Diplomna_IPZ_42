import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import SaveIcon from '@mui/icons-material/Save'
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

const emptyForm: AdminGameForm = {
  title: '',
  genreId: '',
  description: '',
  players: '',
  difficulty: '',
  coverImage: '',
  rating: '',
  playUrl: '',
}

const createSlug = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
    .replace(/\s+/g, '-')

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
    setMessage('')
  }

  const saveGame = async () => {
    if (!editingId) {
      setMessage('Спочатку обери гру зі списку для редагування.')
      return
    }

    if (!form.title.trim() || !form.description.trim() || !form.genreId) {
      setMessage('Заповни назву, жанр та опис гри.')
      return
    }

    const rating = Number(form.rating)

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      setMessage('Рейтинг має бути числом від 0 до 5.')
      return
    }

    const { error } = await supabase
      .from('games')
      .update({
        title: form.title.trim(),
        slug: createSlug(form.title),
        genre_id: Number(form.genreId),
        description: form.description.trim(),
        players: form.players.trim() || '1 гравець',
        difficulty: form.difficulty.trim() || 'Легка',
        cover_image: form.coverImage.trim(),
        play_url: form.playUrl.trim() || null,
        rating,
      })
      .eq('id', editingId)

    if (error) {
      setMessage(`Не вдалося зберегти гру: ${error.message}`)
      return
    }

    setMessage('Гру оновлено.')
    clearForm()
    await loadAdminData()
    await onCatalogChange()
  }

  const uploadCoverImage = async (file: File) => {
    if (!editingId) {
      setMessage('Спочатку обери гру для редагування.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Обери файл зображення.')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      setMessage('Зображення має бути до 4 MB.')
      return
    }

    setIsCoverUploading(true)
    setMessage('')

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const slug = createSlug(form.title) || `game-${editingId}`
    const filePath = `${editingId}/${slug}-${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('game-covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      setIsCoverUploading(false)
      setMessage(`Не вдалося завантажити заставку: ${uploadError.message}`)
      return
    }

    const { data } = supabase.storage.from('game-covers').getPublicUrl(filePath)

    updateField('coverImage', data.publicUrl)
    setIsCoverUploading(false)
    setMessage('Заставку завантажено. Натисни "Зберегти", щоб застосувати її до гри.')
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
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Paper sx={{ width: { xs: '100%', lg: 420 }, p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              {editingId ? 'Редагувати гру' : 'Обери гру'}
            </Typography>

            <Stack spacing={2}>
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
                <TextField label="Зображення" value={form.coverImage} onChange={(event) => updateField('coverImage', event.target.value)} placeholder="/games_images/shooter.png" fullWidth />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  disabled={isCoverUploading || !editingId}
                >
                  {isCoverUploading ? 'Завантаження...' : 'Обрати заставку з ПК'}
                  <Box
                    component="input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0]

                      if (file) {
                        void uploadCoverImage(file)
                      }

                      event.target.value = ''
                    }}
                  />
                </Button>
              </Stack>
              <TextField label="Шлях запуску" value={form.playUrl} onChange={(event) => updateField('playUrl', event.target.value)} placeholder="/games/shooter/index.html" fullWidth />

              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={saveGame}>
                  Зберегти
                </Button>
                <Button variant="outlined" onClick={clearForm}>Очистити</Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, width: '100%', p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h2" sx={{ mb: 2 }}>Список ігор</Typography>
            <Stack spacing={2}>
              {gameList.map((game) => (
                <Box key={game.id}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                    <Box component="img" src={game.coverImage} alt={game.title} sx={{ width: { xs: '100%', md: 160 }, height: 92, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1, flexWrap: 'wrap' }}>
                        <Chip label={game.genre} color="primary" size="small" />
                        <Chip label={game.difficulty} variant="outlined" size="small" />
                        <Chip label={game.rating.toFixed(1)} variant="outlined" size="small" />
                      </Stack>
                      <Typography variant="h3">{game.title}</Typography>
                      <Typography color="text.secondary">{game.description}</Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => startEdit(game)}>
                      Редагувати
                    </Button>
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
            {genreList.map((genre) => <Chip key={genre.id} label={genre.name} color="primary" />)}
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
