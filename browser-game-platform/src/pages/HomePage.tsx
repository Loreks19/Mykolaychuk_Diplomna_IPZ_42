import {
  Box,
  Button,
  Container,
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
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
          Платформа браузерних ігор
        </Typography>

        <Typography color="text.secondary" sx={{ maxWidth: 680, fontSize: 18, lineHeight: 1.6 }}>
          Каталог простих ігор, які можна запускати прямо у браузері. Поки дані
          зберігаються у frontend, але структура підготовлена для API.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Пошук гри"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
