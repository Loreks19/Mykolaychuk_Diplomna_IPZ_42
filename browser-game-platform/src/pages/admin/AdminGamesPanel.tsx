import CloudOffIcon from '@mui/icons-material/CloudOff'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { GenreRow } from '../../types/database'
import { gameAdminPanelHeight, scrollPanelSx } from './constants'
import type { AdminGameForm, EditableGame } from './types'

type AdminGamesPanelProps = {
  form: AdminGameForm
  editingId: number | null
  gameList: EditableGame[]
  genreList: GenreRow[]
  coverFile: File | null
  coverPreviewUrl: string | null
  gameZipFile: File | null
  isCoverUploading: boolean
  isGameUploading: boolean
  updateField: (field: keyof AdminGameForm, value: string) => void
  startCreate: () => void
  startEdit: (game: EditableGame) => void
  clearForm: () => void
  saveGame: () => void
  deleteGame: (game: EditableGame) => void
  cleanupGameFiles: (game: EditableGame) => void
  cleanupGameId: number | null
  setCoverFile: (file: File | null) => void
  setCoverPreviewUrl: (url: string | null) => void
  setGameZipFile: (file: File | null) => void
  setMessage: (message: string) => void
}

function AdminGamesPanel({
  form,
  editingId,
  gameList,
  genreList,
  coverFile,
  coverPreviewUrl,
  gameZipFile,
  isCoverUploading,
  isGameUploading,
  updateField,
  startCreate,
  startEdit,
  clearForm,
  saveGame,
  deleteGame,
  cleanupGameFiles,
  cleanupGameId,
  setCoverFile,
  setCoverPreviewUrl,
  setGameZipFile,
  setMessage,
}: AdminGamesPanelProps) {
  const editingGame = gameList.find((game) => game.id === editingId) ?? null

  const handleCleanupCurrentGame = () => {
    if (!editingGame) {
      setMessage('Неможливо очистити файли гри, бо для неї ще не було додано ZIP-файлів запуску.')
      return
    }

    cleanupGameFiles(editingGame)
  }

  return (
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
            ...scrollPanelSx,
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

          <Button
            color="warning"
            variant="outlined"
            startIcon={<CloudOffIcon />}
            disabled={Boolean(editingId && cleanupGameId === editingId)}
            onClick={handleCleanupCurrentGame}
            fullWidth
            sx={{ minHeight: 46 }}
          >
            {editingId && cleanupGameId === editingId ? 'Очищення...' : 'Очистити файли гри'}
          </Button>

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
            ...scrollPanelSx,
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
  )
}

export default AdminGamesPanel
