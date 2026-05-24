import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { Game } from '../data/games'

type GameCardProps = {
  game: Game
  onOpen: (game: Game) => void
}

function GameCard({ game, onOpen }: GameCardProps) {
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
          backgroundImage: `linear-gradient(180deg, transparent, rgba(11, 16, 32, 0.62)), url(${game.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip label={game.genre} color="primary" size="small" />
          <Chip label={game.difficulty} variant="outlined" size="small" />
        </Stack>

        <Typography component="h3" variant="h3" sx={{ mb: 1 }}>
          {game.title}
        </Typography>

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
