import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, Button, Card, CardActions, CardContent, Chip, IconButton, Rating, Stack, Typography } from '@mui/material'
import type { Game } from '../types/game'

type GameCardProps = {
  game: Game
  isFavorite?: boolean
  onOpen: (game: Game) => void
  onToggleFavorite?: (gameId: number) => boolean | Promise<boolean>
}

function GameCard({ game, isFavorite = false, onOpen, onToggleFavorite }: GameCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        isolation: 'isolate',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
        borderColor: 'rgba(159, 219, 240, 0.13)',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.26)',
        transition: 'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          opacity: 0,
          boxShadow: '0 0 0 1px rgba(103, 179, 250, 0.52), 0 0 34px rgba(15, 105, 222, 0.28)',
          transition: 'opacity 220ms ease',
        },
        '&:hover': {
          transform: 'translate3d(0, -6px, 0)',
          borderColor: 'primary.light',
          boxShadow: '0 26px 70px rgba(15, 105, 222, 0.3)',
        },
        '&:hover::before': {
          opacity: 1,
        },
        '&:hover .game-card-cover': {
          filter: 'saturate(1.08) brightness(1.06)',
        },
      }}
    >
      <Box
        sx={{
          height: 170,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#0B1020',
          flexShrink: 0,
        }}
      >
        <Box
          className="game-card-cover"
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${game.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            filter: 'saturate(1) brightness(1)',
            transition: 'filter 220ms ease',
          }}
        />
        <Box
          className="game-card-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 1,
            background:
              'linear-gradient(180deg, rgba(11, 16, 32, 0.08), rgba(16, 24, 44, 0.96)), linear-gradient(135deg, rgba(15, 105, 222, 0.28), transparent 48%)',
            zIndex: 1,
          }}
        />
        {onToggleFavorite && (
          <IconButton
            color={isFavorite ? 'primary' : 'default'}
            onClick={() => onToggleFavorite(game.id)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 3,
              bgcolor: 'rgba(11, 16, 32, 0.72)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(159, 219, 240, 0.2)',
              '&:hover': { bgcolor: 'rgba(15, 105, 222, 0.34)' },
            }}
            aria-label="Додати в обране"
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '-1px',
          position: 'relative',
          zIndex: 2,
          bgcolor: '#10182C',
          boxShadow: '0 -2px 0 #10182C',
        }}
      >
        <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip label={game.genre} color="primary" size="small" />
          <Chip label={game.difficulty} variant="outlined" size="small" />
          {!game.playUrl && <Chip label="Без запуску" color="warning" variant="outlined" size="small" />}
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

        <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
          {game.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {game.players}
        </Typography>

        <Button variant={game.playUrl ? 'contained' : 'outlined'} endIcon={<PlayArrowIcon />} onClick={() => onOpen(game)}>
          {game.playUrl ? 'Відкрити' : 'Деталі'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default GameCard
