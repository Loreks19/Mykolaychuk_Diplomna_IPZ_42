import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, Button, Card, CardActions, CardContent, Chip, IconButton, Rating, Stack, Typography } from '@mui/material'
import type { Game } from '../data/games'

type GameCardProps = {
  game: Game
  isFavorite?: boolean
  onOpen: (game: Game) => void
  onToggleFavorite?: (gameId: number) => void
}

function GameCard({ game, isFavorite = false, onOpen, onToggleFavorite }: GameCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.24)',
        transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.light',
          boxShadow: '0 22px 60px rgba(15, 105, 222, 0.28)',
        },
      }}
    >
      <Box
        sx={{
          height: 170,
          position: 'relative',
          backgroundImage: `linear-gradient(180deg, transparent, rgba(11, 16, 32, 0.72)), url(${game.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {onToggleFavorite && (
          <IconButton
            color={isFavorite ? 'primary' : 'default'}
            onClick={() => onToggleFavorite(game.id)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(11, 16, 32, 0.72)',
              '&:hover': { bgcolor: 'rgba(15, 105, 222, 0.34)' },
            }}
            aria-label="Додати в обране"
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip label={game.genre} color="primary" size="small" />
          <Chip label={game.difficulty} variant="outlined" size="small" />
        </Stack>

        <Typography component="h3" variant="h3" sx={{ mb: 1 }}>
          {game.title}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Rating value={game.rating} precision={0.1} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            {game.rating.toFixed(1)}
          </Typography>
        </Stack>

        <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {game.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {game.players}
        </Typography>

        <Button variant="contained" endIcon={<PlayArrowIcon />} onClick={() => onOpen(game)}>
          Відкрити
        </Button>
      </CardActions>
    </Card>
  )
}

export default GameCard
