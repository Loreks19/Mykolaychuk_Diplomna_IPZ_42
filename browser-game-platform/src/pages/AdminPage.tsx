import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
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
import { useState } from 'react'
import { games, genres, type Game, type GameGenre } from '../data/games'

type AdminTab = 'games' | 'genres' | 'comments'

type AdminGameForm = {
  title: string
  genre: GameGenre
  description: string
  players: string
  difficulty: string
  coverImage: string
  rating: string
  playUrl: string
}

const emptyForm: AdminGameForm = {
  title: '',
  genre: 'Екшн',
  description: '',
  players: '1 гравець',
  difficulty: 'Легка',
  coverImage: '',
  rating: '4.0',
  playUrl: '',
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('games')
  const [gameList, setGameList] = useState(games)
  const [form, setForm] = useState<AdminGameForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const genreOptions = genres.filter((genre) => genre !== 'Усі') as GameGenre[]

  const updateField = (field: keyof AdminGameForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const startEdit = (game: Game) => {
    setEditingId(game.id)
    setForm({
      title: game.title,
      genre: game.genre,
      description: game.description,
      players: game.players,
      difficulty: game.difficulty,
      coverImage: game.coverImage,
      rating: String(game.rating),
      playUrl: game.playUrl ?? '',
    })
  }

  const clearForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const saveGame = () => {
    if (!form.title.trim() || !form.description.trim()) {
      return
    }

    const gameData = {
      ...form,
      slug: form.title.toLowerCase().replaceAll(' ', '-'),
      rating: Number(form.rating) || 0,
      playUrl: form.playUrl || undefined,
    }

    if (editingId) {
      setGameList((currentGames) =>
        currentGames.map((game) => (game.id === editingId ? { ...game, ...gameData } : game)),
      )
    } else {
      setGameList((currentGames) => [{ id: Date.now(), ...gameData }, ...currentGames])
    }

    clearForm()
  }

  const deleteGame = (gameId: number) => {
    setGameList((currentGames) => currentGames.filter((game) => game.id !== gameId))
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
          Це frontend-макет адмін-панелі. Пізніше ця форма буде працювати з Supabase.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, value: AdminTab) => setActiveTab(value)} variant="scrollable">
          <Tab label="Ігри" value="games" />
          <Tab label="Жанри" value="genres" />
          <Tab label="Коментарі" value="comments" />
        </Tabs>
      </Paper>

      {activeTab === 'games' && (
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Paper sx={{ width: { xs: '100%', lg: 420 }, p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              {editingId ? 'Редагувати гру' : 'Додати гру'}
            </Typography>

            <Stack spacing={2}>
              <TextField label="Назва гри" value={form.title} onChange={(event) => updateField('title', event.target.value)} fullWidth />
              <TextField select label="Жанр" value={form.genre} onChange={(event) => updateField('genre', event.target.value)} fullWidth>
                {genreOptions.map((genre) => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </TextField>
              <TextField label="Опис" value={form.description} onChange={(event) => updateField('description', event.target.value)} multiline minRows={3} fullWidth />
              <TextField label="Кількість гравців" value={form.players} onChange={(event) => updateField('players', event.target.value)} fullWidth />
              <TextField label="Складність" value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)} fullWidth />
              <TextField label="Рейтинг" value={form.rating} onChange={(event) => updateField('rating', event.target.value)} fullWidth />
              <TextField label="Зображення" value={form.coverImage} onChange={(event) => updateField('coverImage', event.target.value)} placeholder="/games_images/shooter.png" fullWidth />
              <TextField label="Шлях запуску" value={form.playUrl} onChange={(event) => updateField('playUrl', event.target.value)} placeholder="/games/shooter/index.html" fullWidth />

              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={saveGame}>
                  {editingId ? 'Зберегти' : 'Додати'}
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
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" startIcon={<EditIcon />} onClick={() => startEdit(game)}>Редагувати</Button>
                      <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => deleteGame(game.id)}>Видалити</Button>
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
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {genreOptions.map((genre) => <Chip key={genre} label={genre} color="primary" />)}
          </Stack>
        </Paper>
      )}

      {activeTab === 'comments' && (
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>Модерація коментарів</Typography>
          <Typography color="text.secondary">
            Поки це місце під майбутню таблицю коментарів. Коли буде Supabase, сюди можна вивести всі коментарі користувачів.
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default AdminPage
