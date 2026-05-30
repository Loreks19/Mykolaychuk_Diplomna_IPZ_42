import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import type { CommentRow, RatingRow, UserRole } from '../types/database'
import type { Game } from '../types/game'

type UseGamePageParams = {
  game: Game
  userId: string | null
  userName: string
  userRole: UserRole
  avatarUrl: string | null
  isFavorite: boolean
  onToggleFavorite: (gameId: number) => boolean | Promise<boolean>
}

function useGamePage({ game, userId, userName, userRole, avatarUrl, isFavorite, onToggleFavorite }: UseGamePageParams) {
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
      setMessage('Не вдалося змінити обране. Перевір, чи є ця гра в каталозі.')
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

  return {
    addComment,
    averageRating,
    commentText,
    comments,
    deleteComment,
    gameFrameRef,
    gameShellRef,
    gameVolume,
    handleFavoriteClick,
    handleFrameLoad,
    isGameFullscreen,
    isGameMuted,
    isLoading,
    message,
    ratingCount: ratings.length,
    saveRating,
    setCommentText,
    setMessage,
    focusGameFrame,
    toggleGameFullscreen,
    toggleGameMute,
    updateGameVolume,
    userRating,
  }
}

export default useGamePage
