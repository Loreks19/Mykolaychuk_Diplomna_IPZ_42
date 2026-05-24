import FavoriteIcon from '@mui/icons-material/Favorite'
import PersonIcon from '@mui/icons-material/Person'
import { Avatar, Box, Container, Paper, Stack, Typography } from '@mui/material'
import GameCard from '../components/GameCard'
import { favoriteGames, type Game } from '../data/games'

type ProfilePageProps = {
  onOpenGame: (game: Game) => void
}

function ProfilePage({ onOpenGame }: ProfilePageProps) {
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
              Гравець GamletLand
            </Typography>
            <Typography color="text.secondary">
              Тут користувач зможе переглядати обрані ігри, свою активність і майбутню статистику.
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
            <Typography variant="h2">0</Typography>
            <Typography color="text.secondary">коментарів поки що</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">Frontend</Typography>
            <Typography color="text.secondary">статус кабінету</Typography>
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
          Поки список обраних ігор заданий у frontend. Після підключення Supabase він буде зберігатися для кожного користувача.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 3,
        }}
      >
        {favoriteGames.map((game) => (
          <GameCard key={game.id} game={game} onOpen={onOpenGame} />
        ))}
      </Box>
    </Container>
  )
}

export default ProfilePage
