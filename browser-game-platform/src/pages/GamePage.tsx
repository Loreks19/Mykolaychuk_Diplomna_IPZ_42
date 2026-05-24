import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material'
import type { Game } from '../data/games'

type GamePageProps = {
  game: Game
  onBack: () => void
}

function GamePage({ game, onBack }: GamePageProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
        Назад до каталогу
      </Button>

      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { md: 'center' } }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip label={game.genre} color="primary" />
              <Chip label={game.difficulty} variant="outlined" />
              <Chip label={game.players} variant="outlined" />
            </Stack>

            <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
              {game.title}
            </Typography>

            <Typography color="text.secondary" sx={{ fontSize: 18, lineHeight: 1.7 }}>
              {game.description}
            </Typography>
          </Box>

          {game.playUrl ? (
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
          ) : null}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          overflow: 'hidden',
          bgcolor: '#050815',
          borderColor: 'rgba(103, 179, 250, 0.28)',
          boxShadow: '0 24px 80px rgba(15, 105, 222, 0.2)',
        }}
      >
        {game.playUrl ? (
          <Box
            component="iframe"
            title={game.title}
            src={game.playUrl}
            sx={{
              display: 'block',
              width: '100%',
              height: { xs: 420, md: 640 },
              border: 0,
            }}
          />
        ) : (
          <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h2" sx={{ mb: 1 }}>
              Гра ще не завантажена
            </Typography>
            <Typography color="text.secondary">
              Після експорту з Construct 2 потрібно додати файли в public/games
              і прописати шлях у полі playUrl.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default GamePage
