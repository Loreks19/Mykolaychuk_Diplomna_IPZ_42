import FavoriteIcon from '@mui/icons-material/Favorite'
import PersonIcon from '@mui/icons-material/Person'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { Alert, Avatar, Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import GameCard from '../components/GameCard'
import type { Game } from '../data/games'
import { supabase } from '../services/supabaseClient'

type ProfilePageProps = {
  userId: string | null
  userName: string
  avatarUrl: string | null
  favoriteGames: Game[]
  onOpenGame: (game: Game) => void
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
  onAvatarUpdate: (avatarUrl: string | null) => boolean | Promise<boolean>
}

function ProfilePage({ userId, userName, avatarUrl, favoriteGames, onOpenGame, onToggleFavorite, onAvatarUpdate }: ProfilePageProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
          <Avatar src={avatarUrl ?? undefined} sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="large" />
          </Avatar>

          <Box>
            <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
              Особистий кабінет
            </Typography>
            <Typography component="h1" variant="h1" sx={{ mb: 1 }}>
              {userName}
            </Typography>
            <Typography color="text.secondary">
              Тут користувач може переглядати обрані ігри та налаштовувати аватарку профілю.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Аватарка профілю</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
          <Avatar src={avatarUrl ?? undefined} sx={{ width: 88, height: 88, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Button
            component="label"
            variant="contained"
            startIcon={<PhotoCameraIcon />}
            disabled={isUploading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isUploading ? 'Завантаження...' : 'Обрати з комп’ютера'}
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
            <Typography variant="h2">{favoriteGames.length}</Typography>
            <Typography color="text.secondary">обрані ігри</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">Supabase</Typography>
            <Typography color="text.secondary">дані зберігаються в базі</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">Frontend</Typography>
            <Typography color="text.secondary">кабінет без зайвої складності</Typography>
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FavoriteIcon color="primary" />
          <Typography component="h2" variant="h2">
            Обрані ігри
          </Typography>
        </Stack>
        <Typography color="text.secondary">
          Натисни серце на картці гри, щоб прибрати її з обраного.
        </Typography>
      </Box>

      {favoriteGames.length > 0 ? (
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
