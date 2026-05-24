import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SendIcon from '@mui/icons-material/Send'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import type { Game } from '../data/games'
import { supabase } from '../services/supabaseClient'
import type { CommentRow, RatingRow } from '../types/database'

type GamePageProps = {
  game: Game
  userId: string | null
  userName: string
  isFavorite: boolean
  onBack: () => void
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
}

function GamePage({ game, userId, userName, isFavorite, onBack, onToggleFavorite }: GamePageProps) {
  const [comments, setComments] = useState<CommentRow[]>([])
  const [ratings, setRatings] = useState<RatingRow[]>([])
  const [commentText, setCommentText] = useState('')
  const [userRating, setUserRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const averageRating = useMemo(() => {
    if (ratings.length === 0) {
      return game.rating
    }

    const ratingSum = ratings.reduce((sum, rating) => sum + rating.value, 0)
    return ratingSum / ratings.length
  }, [game.rating, ratings])

  useEffect(() => {
    const loadGameData = async () => {
      setIsLoading(true)
      setMessage('')

      const [
        { data: commentsData, error: commentsError },
        { data: ratingsData, error: ratingsError },
      ] = await Promise.all([
        supabase
          .from('comments')
          .select('id, game_id, user_id, author_name, text, created_at')
          .eq('game_id', game.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('ratings')
          .select('id, game_id, user_id, value, created_at')
          .eq('game_id', game.id),
      ])

      if (commentsError || ratingsError) {
        setMessage(commentsError?.message ?? ratingsError?.message ?? 'Не вдалося завантажити дані гри.')
      }

      const nextRatings = (ratingsData ?? []) as RatingRow[]
      setComments((commentsData ?? []) as CommentRow[])
      setRatings(nextRatings)
      setUserRating(nextRatings.find((rating) => rating.user_id === userId)?.value ?? null)
      setIsLoading(false)
    }

    void loadGameData()
  }, [game.id, userId])

  const reloadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, game_id, user_id, author_name, text, created_at')
      .eq('game_id', game.id)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setComments((data ?? []) as CommentRow[])
  }

  const reloadRatings = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('id, game_id, user_id, value, created_at')
      .eq('game_id', game.id)

    if (error) {
      setMessage(error.message)
      return
    }

    const nextRatings = (data ?? []) as RatingRow[]
    setRatings(nextRatings)
    setUserRating(nextRatings.find((rating) => rating.user_id === userId)?.value ?? null)
  }

  const addComment = async () => {
    const trimmedText = commentText.trim()

    if (!userId) {
      setMessage('Щоб написати коментар, спочатку увійди в акаунт.')
      return
    }

    if (!trimmedText) {
      setMessage('Коментар не може бути порожнім.')
      return
    }

    const { error } = await supabase.from('comments').insert({
      game_id: game.id,
      user_id: userId,
      author_name: userName,
      text: trimmedText,
    })

    if (error) {
      setMessage(`Не вдалося зберегти коментар: ${error.message}`)
      return
    }

    setCommentText('')
    setMessage('Коментар додано.')
    await reloadComments()
  }

  const deleteComment = async (commentId: number) => {
    if (!userId) {
      return
    }

    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', userId)

    if (error) {
      setMessage(`Не вдалося видалити коментар: ${error.message}`)
      return
    }

    await reloadComments()
  }

  const saveRating = async (value: number | null) => {
    if (!userId) {
      setMessage('Щоб оцінити гру, спочатку увійди в акаунт.')
      return
    }

    if (!value) {
      return
    }

    const { error } = await supabase.from('ratings').upsert(
      {
        game_id: game.id,
        user_id: userId,
        value,
      },
      { onConflict: 'game_id,user_id' },
    )

    if (error) {
      setMessage(`Не вдалося зберегти оцінку: ${error.message}`)
      return
    }

    await reloadRatings()
    setMessage('Оцінку збережено.')
  }

  const handleFavoriteClick = async () => {
    if (!userId) {
      setMessage('Щоб додати гру в обране, спочатку увійди в акаунт.')
      return
    }

    const isSaved = await onToggleFavorite(game.id)

    if (!isSaved) {
      setMessage('Не вдалося змінити обране. Перевір, чи є ця гра в таблиці games у Supabase.')
      return
    }

    setMessage(isFavorite ? 'Гру прибрано з обраного.' : 'Гру додано в обране.')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
        Назад до каталогу
      </Button>

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
              {averageRating.toFixed(1)} {ratings.length > 0 ? `(${ratings.length})` : ''}
            </Typography>
          </Stack>

          <Button
            variant={isFavorite ? 'contained' : 'outlined'}
            startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleFavoriteClick}
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
              Після експорту з Construct 2 потрібно додати файли в public/games і прописати шлях у полі playUrl.
            </Typography>
          </Box>
        )}
      </Paper>

      <Stack spacing={3}>
        <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Твоя оцінка
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Оцінка зберігається в Supabase. Якщо поставити нову оцінку, стара просто оновиться.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <Rating value={userRating} onChange={(_, value) => saveRating(value)} />
            <Typography color="text.secondary">
              {userRating ? `Ти оцінив гру на ${userRating}` : 'Ти ще не оцінював цю гру'}
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Коментарі
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Коментарі зберігаються у таблиці comments і залишаються під конкретною грою.
          </Typography>

          {message && (
            <Alert severity="info" sx={{ mb: 3 }} onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

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

          {isLoading && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Завантаження коментарів...
            </Typography>
          )}

          <Stack spacing={2}>
            {comments.map((comment) => (
              <Box key={comment.id}>
                <Stack direction="row" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{comment.author_name[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 700 }}>{comment.author_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(comment.created_at).toLocaleDateString('uk-UA')}
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }}>
                      {comment.text}
                    </Typography>
                    {comment.user_id === userId && (
                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteComment(comment.id)}
                        sx={{ mt: 1 }}
                      >
                        Видалити
                      </Button>
                    )}
                  </Box>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Stack>

          {!isLoading && comments.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              Коментарів поки немає. Можеш бути першим.
            </Typography>
          )}
        </Paper>
      </Stack>
    </Container>
  )
}

export default GamePage
