import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SendIcon from '@mui/icons-material/Send'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Rating,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Game } from '../data/games'
import { supabase } from '../services/supabaseClient'
import type { CommentRow, RatingRow, UserRole } from '../types/database'

type GamePageProps = {
  game: Game
  userId: string | null
  userName: string
  userRole: UserRole
  avatarUrl: string | null
  isFavorite: boolean
  onBack: () => void
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
}

function GamePage({ game, userId, userName, userRole, avatarUrl, isFavorite, onBack, onToggleFavorite }: GamePageProps) {
  const gameShellRef = useRef<HTMLDivElement | null>(null)
  const gameFrameRef = useRef<HTMLIFrameElement | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [ratings, setRatings] = useState<RatingRow[]>([])
  const [commentText, setCommentText] = useState('')
  const [userRating, setUserRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameVolume, setGameVolume] = useState(70)
  const [isGameMuted, setIsGameMuted] = useState(false)
  const [isGameFullscreen, setIsGameFullscreen] = useState(false)

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
          .select('id, game_id, user_id, author_name, author_role, author_avatar_url, text, created_at')
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
      .select('id, game_id, user_id, author_name, author_role, author_avatar_url, text, created_at')
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
      author_role: userRole === 'admin' ? 'admin' : 'user',
      author_avatar_url: avatarUrl,
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

    let deleteQuery = supabase.from('comments').delete().eq('id', commentId)

    if (userRole !== 'admin') {
      deleteQuery = deleteQuery.eq('user_id', userId)
    }

    const { error } = await deleteQuery

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

  const postAudioSettings = useCallback(() => {
    gameFrameRef.current?.contentWindow?.postMessage({
      type: 'GAMLETLAND_AUDIO',
      muted: isGameMuted,
      volume: gameVolume / 100,
    }, '*')
  }, [gameVolume, isGameMuted])

  useEffect(() => {
    postAudioSettings()
  }, [postAudioSettings, game.playUrl])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsGameFullscreen(document.fullscreenElement === gameShellRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const focusGameFrame = () => {
    gameFrameRef.current?.focus()
  }

  const handleFrameLoad = () => {
    focusGameFrame()
    postAudioSettings()
  }

  const toggleGameMute = () => {
    if (isGameMuted && gameVolume === 0) {
      setGameVolume(70)
    }

    setIsGameMuted((currentValue) => !currentValue)
  }

  const updateGameVolume = (_: Event, value: number | number[]) => {
    const nextVolume = Array.isArray(value) ? value[0] : value
    setGameVolume(nextVolume)
    setIsGameMuted(nextVolume === 0)
  }

  const toggleGameFullscreen = async () => {
    if (!gameShellRef.current) {
      return
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await gameShellRef.current.requestFullscreen()
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
        ref={gameShellRef}
        variant="outlined"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
          bgcolor: '#050815',
          borderColor: 'rgba(103, 179, 250, 0.28)',
          boxShadow: '0 24px 80px rgba(15, 105, 222, 0.2)',
          '&:fullscreen': {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {game.playUrl ? (
          <>
            <Box
              component="iframe"
              ref={gameFrameRef}
              title={game.title}
              src={game.playUrl}
              allow="autoplay; fullscreen; gamepad; pointer-lock"
              allowFullScreen
              tabIndex={0}
              onLoad={handleFrameLoad}
              onMouseEnter={focusGameFrame}
              onPointerDown={focusGameFrame}
              sx={{
                display: 'block',
                width: '100%',
                height: { xs: 420, md: 640 },
                flex: 1,
                border: 0,
                pointerEvents: 'auto',
                userSelect: 'none',
              }}
            />

            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                position: 'absolute',
                left: { xs: 10, md: 18 },
                bottom: { xs: 10, md: 18 },
                zIndex: 2,
                alignItems: 'center',
                px: 1,
                py: 0.75,
                bgcolor: 'rgba(5, 8, 21, 0.5)',
                borderRadius: 999,
                boxShadow: '0 16px 42px rgba(0, 0, 0, 0.45), 0 0 24px rgba(25, 118, 210, 0.22)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <Tooltip title={isGameMuted ? 'Увімкнути звук' : 'Вимкнути звук'}>
                <IconButton
                  size="small"
                  onClick={toggleGameMute}
                  aria-label={isGameMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                  sx={{
                    width: 36,
                    height: 36,
                    color: '#EAF4FF',
                    bgcolor: 'rgba(25, 118, 210, 0.72)',
                    border: '1px solid rgba(103, 179, 250, 0.82)',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                  }}
                >
                  {isGameMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Slider
                value={isGameMuted ? 0 : gameVolume}
                min={0}
                max={100}
                onChange={updateGameVolume}
                aria-label="Гучність гри"
                sx={{
                  width: { xs: 96, sm: 132 },
                  color: 'primary.light',
                  '& .MuiSlider-rail': { opacity: 0.5 },
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                    boxShadow: '0 0 0 4px rgba(103, 179, 250, 0.18)',
                  },
                }}
              />

              <Typography variant="caption" sx={{ minWidth: 34, textAlign: 'center', color: '#EAF4FF', fontWeight: 800 }}>
                {isGameMuted ? 0 : gameVolume}%
              </Typography>
            </Stack>

            <Tooltip title={isGameFullscreen ? 'Вийти з повного екрана' : 'На весь екран'}>
              <IconButton
                size="small"
                onClick={toggleGameFullscreen}
                aria-label={isGameFullscreen ? 'Вийти з повного екрана' : 'На весь екран'}
                sx={{
                  position: 'absolute',
                  right: { xs: 10, md: 18 },
                  bottom: { xs: 10, md: 18 },
                  zIndex: 2,
                  width: 52,
                  height: 52,
                  color: '#EAF4FF',
                  bgcolor: 'rgba(5, 8, 21, 0.5)',
                  border: '1px solid rgba(103, 179, 250, 0.82)',
                  '& .MuiSvgIcon-root': {
                    fontSize: 30,
                  },
                  boxShadow: '0 16px 42px rgba(0, 0, 0, 0.45), 0 0 24px rgba(25, 118, 210, 0.22)',
                  backdropFilter: 'blur(14px)',
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.58)',
                  },
                }}
              >
                {isGameFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </>
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
            Поділись враженням від гри: твоя оцінка допоможе іншим швидше знайти найцікавіші проєкти.
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
            Розкажи, що сподобалось, поділись порадою або залиш перше враження після проходження.
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
                  <Avatar src={comment.author_avatar_url ?? undefined} sx={{ bgcolor: comment.author_role === 'admin' ? '#D7A721' : 'primary.main' }}>
                    {comment.author_name[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 700 }}>{comment.author_name}</Typography>
                        {comment.author_role === 'admin' && (
                          <Chip
                            icon={<WorkspacePremiumIcon />}
                            label="Адмін"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(215, 167, 33, 0.18)',
                              color: '#FFD66B',
                              border: '1px solid rgba(255, 214, 107, 0.45)',
                              '& .MuiChip-icon': { color: '#FFD66B' },
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(comment.created_at).toLocaleDateString('uk-UA')}
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }}>
                      {comment.text}
                    </Typography>
                    {(comment.user_id === userId || userRole === 'admin') && (
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
