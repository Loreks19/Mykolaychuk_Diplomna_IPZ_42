import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Box,
  Button,
  Chip,
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import type { Game } from '../../types/game'

type GameHeroProps = {
  game: Game
  averageRating: number
  ratingCount: number
  isFavorite: boolean
  onFavoriteClick: () => void | Promise<void>
}

function GameHero({ game, averageRating, ratingCount, isFavorite, onFavoriteClick }: GameHeroProps) {
  return (
    <Paper sx={{ overflow: 'hidden', mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          minHeight: 300,
          p: { xs: 3, md: 4 },
          display: 'flex',
          alignItems: 'flex-end',
          backgroundImage: `linear-gradient(90deg, rgba(11, 16, 32, 0.95), rgba(11, 16, 32, 0.35)), url(${game.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip label={game.genre} color="primary" />
            <Chip label={game.difficulty} variant="outlined" />
            <Chip label={game.players} variant="outlined" />
          </Stack>

          <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
            {game.title}
          </Typography>

          <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: 18, lineHeight: 1.7 }}>
            {game.description}
          </Typography>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 3, alignItems: { md: 'center' } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: 1 }}>
          <Rating value={averageRating} precision={0.1} readOnly />
          <Typography color="text.secondary">
            {averageRating.toFixed(1)} {ratingCount > 0 ? `(${ratingCount})` : ''}
          </Typography>
        </Stack>

        <Button
          variant={isFavorite ? 'contained' : 'outlined'}
          startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={onFavoriteClick}
        >
          {isFavorite ? 'В обраному' : 'Додати в обране'}
        </Button>

        {game.playUrl && (
          <Button
            component="a"
            href={game.playUrl}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            endIcon={<OpenInNewIcon />}
          >
            Відкрити в новій вкладці
          </Button>
        )}
      </Stack>
    </Paper>
  )
}

export default GameHero
