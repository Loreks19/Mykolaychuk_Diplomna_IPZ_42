import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import type { Game } from '../data/games'

type GameCardProps = {
  game: Game
  onOpen: (game: Game) => void
}

function GameCard({ game, onOpen }: GameCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
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
