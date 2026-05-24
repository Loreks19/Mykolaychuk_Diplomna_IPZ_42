import FavoriteIcon from '@mui/icons-material/Favorite'
import PersonIcon from '@mui/icons-material/Person'
import { Avatar, Box, Container, Paper, Stack, Typography } from '@mui/material'
import GameCard from '../components/GameCard'
import type { Game } from '../data/games'

type ProfilePageProps = {
  userName: string
  favoriteGames: Game[]
  onOpenGame: (game: Game) => void
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
}

function ProfilePage({ userName, favoriteGames, onOpenGame, onToggleFavorite }: ProfilePageProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
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
              Тут користувач може переглядати обрані ігри. Пізніше сюди можна додати історію оцінок і коментарів.
            </Typography>
          </Box>
        </Stack>
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
