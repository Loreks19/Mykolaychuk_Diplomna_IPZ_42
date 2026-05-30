import FavoriteIcon from '@mui/icons-material/Favorite'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import GameCard from '../components/GameCard'
import useProfileStats from '../hooks/useProfileStats'
import { supabase } from '../services/supabaseClient'
import type { Game } from '../types/game'

type ProfilePageProps = {
  userId: string | null
  userName: string
  avatarUrl: string | null
  favoriteGames: Game[]
  isFavoritesLoading: boolean
  onOpenGame: (game: Game) => void
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
  onAvatarUpdate: (avatarUrl: string | null) => boolean | Promise<boolean>
  onNameUpdate: (name: string) => boolean | Promise<boolean>
}

function ProfilePage({ userId, userName, avatarUrl, favoriteGames, isFavoritesLoading, onOpenGame, onToggleFavorite, onAvatarUpdate, onNameUpdate }: ProfilePageProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [nextUserName, setNextUserName] = useState(userName)
  const [isNameSaving, setIsNameSaving] = useState(false)
  const { commentCount, ratedGameCount } = useProfileStats(userId)

  const uploadAvatar = async (file: File) => {
    if (!userId) {
      setMessage('Щоб змінити аватарку, спочатку увійди в акаунт.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Обери файл зображення.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Зображення має бути до 2 MB.')
      return
    }

    setIsUploading(true)
    setMessage('')

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const filePath = `${userId}/avatar-${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      setIsUploading(false)
      setMessage(`Не вдалося завантажити аватарку: ${uploadError.message}`)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const nextAvatarUrl = data.publicUrl
    const isSaved = await onAvatarUpdate(nextAvatarUrl)

    setIsUploading(false)
    setMessage(isSaved ? 'Аватарку оновлено.' : 'Не вдалося оновити аватарку.')
  }

  const saveUserName = async () => {
    const trimmedName = nextUserName.trim()

    if (!trimmedName) {
      setMessage('Ім’я не може бути порожнім.')
      return
    }

    setIsNameSaving(true)
    const isSaved = await onNameUpdate(trimmedName)
    setIsNameSaving(false)

    if (!isSaved) {
      setMessage('Не вдалося оновити ім’я.')
      return
    }

    setIsNameDialogOpen(false)
    setMessage('Ім’я оновлено.')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { md: 'center' } }}>
          <Avatar src={avatarUrl ?? undefined} sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="large" />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography component="h1" variant="h1" sx={{ mb: 1 }}>
              {userName}
            </Typography>
            <Typography color="text.secondary">
              Тут користувач може переглядати обрані ігри та налаштовувати аватарку профілю.
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ width: { xs: '100%', md: 190 } }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<PhotoCameraIcon />}
              disabled={isUploading}
              fullWidth
            >
              {isUploading ? 'Завантаження...' : 'Оновити аватар'}
              <Box
                component="input"
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]

                  if (file) {
                    void uploadAvatar(file)
                  }

                  event.target.value = ''
                }}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                setNextUserName(userName)
                setIsNameDialogOpen(true)
              }}
              fullWidth
            >
              Змінити ім’я
            </Button>
          </Stack>
        </Stack>
        {message && (
          <Alert severity="info" sx={{ mt: 2 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">{isFavoritesLoading ? '...' : favoriteGames.length}</Typography>
            <Typography color="text.secondary">обрані ігри</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">{commentCount ?? '...'}</Typography>
            <Typography color="text.secondary">коментарів залишено</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">{ratedGameCount ?? '...'}</Typography>
            <Typography color="text.secondary">ігор оцінено</Typography>
          </Box>
        </Stack>
      </Paper>

      <Dialog
        open={isNameDialogOpen}
        onClose={() => setIsNameDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Змінити ім’я</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Нове ім’я"
            value={nextUserName}
            onChange={(event) => setNextUserName(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsNameDialogOpen(false)}>
            Скасувати
          </Button>
          <Button variant="contained" onClick={saveUserName} disabled={isNameSaving}>
            {isNameSaving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography component="h2" variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.35rem' } }}>
            Обрані ігри
          </Typography>
          <FavoriteIcon color="primary" sx={{ fontSize: { xs: 26, md: 30 } }} />
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Натисни серце на картці гри, щоб прибрати її з обраного.
        </Typography>
      </Box>

      {isFavoritesLoading ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <Typography color="text.secondary">
            Завантаження обраних ігор...
          </Typography>
        </Paper>
      ) : favoriteGames.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 3,
          }}
        >
          {favoriteGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite
              onOpen={onOpenGame}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Обраних ігор поки немає
          </Typography>
          <Typography color="text.secondary">
            Додай гру в обране з каталогу, і вона з'явиться тут.
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default ProfilePage
