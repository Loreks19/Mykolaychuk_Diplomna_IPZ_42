import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import GameCard from '../components/GameCard'
import { games, genres, type Game } from '../data/games'

type HomePageProps = {
  onOpenGame: (game: Game) => void
}

function HomePage({ onOpenGame }: HomePageProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return games.filter((game) => {
      const fitsGenre = selectedGenre === 'All' || game.genre === selectedGenre
      const fitsSearch = game.title.toLowerCase().includes(normalizedSearch)

      return fitsGenre && fitsSearch
    })
  }, [searchText, selectedGenre])

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto -80px -120px auto',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bgcolor: 'rgba(103, 179, 250, 0.18)',
            filter: 'blur(40px)',
          }}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ position: 'relative' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
              HTML5 Game Platform
            </Typography>
            <Typography component="h1" variant="h1" sx={{ maxWidth: 680, mb: 2 }}>
              Платформа для запуску браузерних ігор
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 680, fontSize: 18, lineHeight: 1.7 }}>
              GamletLand збирає HTML5-ігри в одному каталозі. Користувач може
              переглядати жанри, знаходити ігри та запускати їх прямо у браузері.
            </Typography>
          </Box>

          <Stack
            spacing={2}
            sx={{
              minWidth: { xs: '100%', md: 260 },
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'rgba(11, 16, 32, 0.62)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="h2">{games.length}</Typography>
              <Typography color="text.secondary">ігор у каталозі</Typography>
            </Box>
            <Box>
              <Typography variant="h2">{genres.length - 1}</Typography>
              <Typography color="text.secondary">жанри для фільтрації</Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <TextField
            fullWidth
            label="Пошук гри"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', minWidth: { md: 420 } }}>
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'contained' : 'outlined'}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography component="h2" variant="h2">
          Доступні ігри
        </Typography>
        <Typography color="text.secondary">
          Обери гру з каталогу або відфільтруй список за жанром.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 3,
        }}
      >
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} onOpen={onOpenGame} />
        ))}
      </Box>

      {filteredGames.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          За таким запитом ігор поки немає.
        </Typography>
      )}
    </Container>
  )
}

export default HomePage
