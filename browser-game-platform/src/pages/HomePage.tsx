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
import type { Game, GameGenre } from '../data/games'

type HomePageProps = {
  games: Game[]
  genres: GameGenre[]
  favoriteIds: number[]
  onOpenGame: (game: Game) => void
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
}

function HomePage({ games, genres, favoriteIds, onOpenGame, onToggleFavorite }: HomePageProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Усі')
  const activeGenre = selectedGenre === 'Усі' || genres.includes(selectedGenre) ? selectedGenre : 'Усі'

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return games.filter((game) => {
      const fitsGenre = activeGenre === 'Усі' || game.genre === activeGenre
      const fitsSearch = game.title.toLowerCase().includes(normalizedSearch)

      return fitsGenre && fitsSearch
    })
  }, [activeGenre, games, searchText])

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 6 },
          mb: { xs: 3, md: 5 },
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(159, 219, 240, 0.14)',
          position: 'relative',
          background:
            'linear-gradient(135deg, rgba(16, 24, 44, 0.96), rgba(10, 19, 38, 0.92)), linear-gradient(120deg, rgba(15, 105, 222, 0.3), transparent 42%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(120deg, rgba(103, 179, 250, 0.1), transparent 32%), linear-gradient(315deg, rgba(15, 105, 222, 0.16), transparent 36%)',
          }}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }} sx={{ position: 'relative' }}>
          <Box sx={{ flex: 1 }}>
            <Typography component="h1" variant="h1" sx={{ maxWidth: 720, mb: 2.5 }}>
              Платформа для запуску браузерних ігор
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 700, fontSize: { xs: 16, md: 18 }, lineHeight: 1.75 }}>
              GamletLand збирає HTML5-ігри в одному каталозі. Користувач може
              переглядати жанри, знаходити ігри та запускати їх прямо у браузері.
            </Typography>
          </Box>

          <Stack
            spacing={2}
            sx={{
              minWidth: { xs: '100%', md: 260 },
              p: 3,
              borderRadius: 2,
              bgcolor: 'rgba(8, 13, 27, 0.7)',
              border: '1px solid',
              borderColor: 'rgba(159, 219, 240, 0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <Box>
              <Typography variant="h2">{games.length}</Typography>
              <Typography color="text.secondary">ігор у каталозі</Typography>
            </Box>
            <Box>
              <Typography variant="h2">{genres.length}</Typography>
              <Typography color="text.secondary">жанри для фільтрації</Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 4, md: 5 }, border: '1px solid', borderColor: 'rgba(159, 219, 240, 0.14)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: { md: 'center' } }}>
          <TextField
            fullWidth
            label="Пошук гри"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', minWidth: { md: 420 } }}>
            {['Усі', ...genres].map((genre) => (
              <Button
                key={genre}
                variant={activeGenre === genre ? 'contained' : 'outlined'}
                onClick={() => setSelectedGenre(genre)}
                sx={{ minHeight: 38 }}
              >
                {genre}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ mb: 2.5 }}>
        <Typography component="h2" variant="h2">
          Доступні ігри
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 680, lineHeight: 1.7 }}>
          Обери гру з каталогу або відфільтруй список за жанром.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favoriteIds.includes(game.id)}
            onOpen={onOpenGame}
            onToggleFavorite={onToggleFavorite}
          />
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
