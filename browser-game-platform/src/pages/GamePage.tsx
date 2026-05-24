import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SendIcon from '@mui/icons-material/Send'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { Game } from '../data/games'

type GamePageProps = {
  game: Game
  onBack: () => void
}

type GameComment = {
  id: number
  author: string
  text: string
}

const startComments: GameComment[] = [
  {
    id: 1,
    author: 'Олег',
    text: 'Гра запускається швидко, для браузерної платформи виглядає нормально.',
  },
  {
    id: 2,
    author: 'Марина',
    text: 'Було б цікаво додати рейтинг і таблицю результатів.',
  },
]

function GamePage({ game, onBack }: GamePageProps) {
  const [comments, setComments] = useState(startComments)
  const [commentText, setCommentText] = useState('')

  const addComment = () => {
    const trimmedText = commentText.trim()

    if (!trimmedText) {
      return
    }

    const newComment: GameComment = {
      id: Date.now(),
      author: 'Гравець',
      text: trimmedText,
    }

    setComments((currentComments) => [newComment, ...currentComments])
    setCommentText('')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
        Назад до каталогу
      </Button>

      <Paper sx={{ overflow: 'hidden', mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            minHeight: 280,
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

        {game.playUrl ? (
          <Box sx={{ p: 3 }}>
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
          </Box>
        ) : null}
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          overflow: 'hidden',
          mb: 3,
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

      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Коментарі
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Поки коментарі працюють тільки у frontend і зникають після перезавантаження сторінки.
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Написати коментар"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            multiline
            minRows={2}
          />
          <Button variant="contained" endIcon={<SendIcon />} onClick={addComment} sx={{ alignSelf: { md: 'flex-start' } }}>
            Додати
          </Button>
        </Stack>

        <Stack spacing={2}>
          {comments.map((comment) => (
            <Box key={comment.id}>
              <Stack direction="row" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{comment.author[0]}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{comment.author}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {comment.text}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  )
}

export default GamePage
