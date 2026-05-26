import {
  Alert,
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { deleteGameArchive, uploadGameArchive } from '../services/gameUploadWorker'
import type { CommentRow, GameRow, GenreRow } from '../types/database'
import AdminCommentsPanel from './admin/AdminCommentsPanel'
import AdminGamesPanel from './admin/AdminGamesPanel'
import AdminGenresPanel from './admin/AdminGenresPanel'
import { emptyGameForm } from './admin/constants'
import { createSlug } from './admin/helpers'
import type { AdminComment, AdminGameForm, AdminPageProps, AdminTab, EditableGame } from './admin/types'

type GameFormValidation =
  | { isValid: false; error: string }
  | { isValid: true; rating: number; slug: string }

function AdminPage({ userRole, onCatalogChange }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('games')
  const [gameList, setGameList] = useState<EditableGame[]>([])
  const [genreList, setGenreList] = useState<GenreRow[]>([])
  const [comments, setComments] = useState<AdminComment[]>([])
  const [form, setForm] = useState<AdminGameForm>(emptyGameForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newGenreName, setNewGenreName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCoverUploading, setIsCoverUploading] = useState(false)
  const [isGameUploading, setIsGameUploading] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [gameZipFile, setGameZipFile] = useState<File | null>(null)

  const gameTitleById = useMemo(
    () => new Map(gameList.map((game) => [game.id, game.title])),
    [gameList],
  )

  const loadAdminData = useCallback(async () => {
    if (userRole !== 'admin') {
      return
    }

    setIsLoading(true)
    setMessage('')

    const [
      { data: genreData, error: genreError },
      { data: gameData, error: gameError },
      { data: commentData, error: commentError },
    ] = await Promise.all([
      supabase
        .from('genres')
        .select('id, name, created_at')
        .order('name', { ascending: true }),
      supabase
        .from('games')
        .select('id, title, slug, genre_id, description, players, difficulty, cover_image, play_url, rating, created_at')
        .order('id', { ascending: true }),
      supabase
        .from('comments')
        .select('id, game_id, user_id, author_name, author_role, author_avatar_url, text, created_at')
        .order('created_at', { ascending: false }),
    ])

    if (genreError || gameError || commentError) {
      setMessage(genreError?.message ?? gameError?.message ?? commentError?.message ?? 'Не вдалося завантажити дані.')
      setIsLoading(false)
      return
    }

    const nextGenres = (genreData ?? []) as GenreRow[]
    const genreById = new Map(nextGenres.map((genre) => [genre.id, genre.name]))
    const nextGames = ((gameData ?? []) as GameRow[]).map((game) => ({
      id: game.id,
      title: game.title,
      slug: game.slug,
      genreId: game.genre_id,
      genre: (game.genre_id ? genreById.get(game.genre_id) : undefined) ?? 'Без жанру',
      description: game.description,
      players: game.players,
      difficulty: game.difficulty,
      coverImage: game.cover_image,
      rating: game.rating,
      playUrl: game.play_url ?? undefined,
    }))
    const nextGameTitleById = new Map(nextGames.map((game) => [game.id, game.title]))

    setGenreList(nextGenres)
    setGameList(nextGames)
    setComments(((commentData ?? []) as CommentRow[]).map((comment) => ({
      ...comment,
      gameTitle: nextGameTitleById.get(comment.game_id) ?? `Гра #${comment.game_id}`,
    })))
    setIsLoading(false)
  }, [userRole])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdminData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadAdminData])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  const updateField = (field: keyof AdminGameForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setMessage('')
  }

  const clearForm = () => {
    setEditingId(null)
    setForm(emptyGameForm)
    setCoverFile(null)
    setCoverPreviewUrl(null)
    setGameZipFile(null)
    setMessage('')
  }

  const startCreate = () => {
    clearForm()
    setActiveTab('games')
    setMessage('Заповни форму та натисни "Додати гру".')
  }

  const startEdit = (game: EditableGame) => {
    setEditingId(game.id)
    setCoverFile(null)
    setCoverPreviewUrl(null)
    setGameZipFile(null)
    setForm({
      title: game.title,
      genreId: game.genreId ? String(game.genreId) : '',
      description: game.description,
      players: game.players,
      difficulty: game.difficulty,
      coverImage: game.coverImage,
      rating: String(game.rating),
      playUrl: game.playUrl ?? '',
    })
    setActiveTab('games')
    setMessage('')
  }

  const uploadCoverImage = async (gameId: number, title: string, file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const slug = createSlug(title) || `game-${gameId}`
    const filePath = `${gameId}/${slug}-${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('game-covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage.from('game-covers').getPublicUrl(filePath)
    return data.publicUrl
  }

  const validateGameForm = (): GameFormValidation => {
    const rating = Number(form.rating)
    const slug = createSlug(form.title)

    if (!form.title.trim() || !form.description.trim() || !form.genreId) {
      return { isValid: false, error: 'Заповни назву, жанр та опис гри.' }
    }

    if (!editingId && !coverFile) {
      return { isValid: false, error: 'Для нової гри додай заставку з ПК.' }
    }

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      return { isValid: false, error: 'Рейтинг має бути числом від 0 до 5.' }
    }

    if (!slug) {
      return { isValid: false, error: 'Назва гри має містити хоча б одну літеру або цифру для створення адреси гри.' }
    }

    return { isValid: true, rating, slug }
  }

  const updateUploadedAssets = async (gameId: number) => {
    if (coverFile) {
      const coverUrl = await uploadCoverImage(gameId, form.title, coverFile)
      const { error } = await supabase.from('games').update({ cover_image: coverUrl }).eq('id', gameId)

      if (error) {
        throw new Error(`Заставку завантажено, але не вдалося оновити гру: ${error.message}`)
      }
    }

    if (gameZipFile) {
      const playUrl = await uploadGameArchive(gameId, form.title, gameZipFile)
      const { error } = await supabase.from('games').update({ play_url: playUrl }).eq('id', gameId)

      if (error) {
        throw new Error(`Архів гри завантажено, але не вдалося оновити шлях запуску: ${error.message}`)
      }
    }
  }

  const saveGame = async () => {
    const validation = validateGameForm()

    if (!validation.isValid) {
      setMessage(validation.error)
      return
    }

    const gamePayload = {
      title: form.title.trim(),
      slug: validation.slug,
      genre_id: Number(form.genreId),
      description: form.description.trim(),
      players: form.players.trim() || '1 гравець',
      difficulty: form.difficulty.trim() || 'Легка',
      cover_image: form.coverImage.trim() || '/games_images/shooter.png',
      play_url: form.playUrl.trim() || null,
      rating: validation.rating,
    }

    setIsCoverUploading(Boolean(coverFile))
    setIsGameUploading(Boolean(gameZipFile))

    try {
      if (editingId) {
        const { error } = await supabase.from('games').update(gamePayload).eq('id', editingId)

        if (error) {
          throw new Error(`Не вдалося зберегти гру: ${error.message}`)
        }

        await updateUploadedAssets(editingId)
        setMessage('Гру оновлено.')
      } else {
        const { data, error } = await supabase
          .from('games')
          .insert(gamePayload)
          .select('id')
          .single<Pick<GameRow, 'id'>>()

        if (error || !data) {
          throw new Error(`Не вдалося додати гру: ${error?.message ?? 'гра не створена'}`)
        }

        await updateUploadedAssets(data.id)
        setMessage('Гру додано.')
      }

      clearForm()
      await loadAdminData()
      await onCatalogChange()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Невідома помилка збереження гри.')
    } finally {
      setIsCoverUploading(false)
      setIsGameUploading(false)
    }
  }

  const addGenre = async () => {
    const name = newGenreName.trim()

    if (!name) {
      setMessage('Введи назву жанру.')
      return
    }

    const { error } = await supabase.from('genres').insert({ name })

    if (error) {
      setMessage(`Не вдалося додати жанр: ${error.message}`)
      return
    }

    setNewGenreName('')
    setMessage('Жанр додано.')
    await loadAdminData()
    await onCatalogChange()
  }

  const deleteComment = async (commentId: number) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)

    if (error) {
      setMessage(`Не вдалося видалити коментар: ${error.message}`)
      return
    }

    setComments((currentComments) => currentComments.filter((comment) => comment.id !== commentId))
    setMessage('Коментар видалено.')
  }

  const deleteGenre = async (genreId: number) => {
    const { error } = await supabase.from('genres').delete().eq('id', genreId)

    if (error) {
      setMessage(`Не вдалося видалити жанр: ${error.message}`)
      return
    }

    setMessage('Жанр видалено.')
    await loadAdminData()
    await onCatalogChange()
  }

  const deleteGame = async (game: EditableGame) => {
    const isConfirmed = window.confirm(`Видалити гру "${game.title}"? Коментарі, оцінки та обране для цієї гри також буде видалено.`)

    if (!isConfirmed) {
      return
    }

    const { error } = await supabase.from('games').delete().eq('id', game.id)

    if (error) {
      setMessage(`Не вдалося видалити гру: ${error.message}`)
      return
    }

    let cleanupMessage = ''

    if (game.playUrl) {
      try {
        const cleanup = await deleteGameArchive(game.slug)
        cleanupMessage = cleanup.skipped ? '' : ` Файли R2 очищено: ${cleanup.deletedCount}.`
      } catch (cleanupError) {
        cleanupMessage = ` Але файли R2 не вдалося очистити: ${cleanupError instanceof Error ? cleanupError.message : 'невідома помилка'}.`
      }
    }

    if (editingId === game.id) {
      clearForm()
    }

    setMessage(`Гру видалено.${cleanupMessage}`)
    await loadAdminData()
    await onCatalogChange()
  }

  if (userRole !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Alert severity="warning">
          Для доступу до адмін-панелі потрібно увійти під акаунтом із роллю admin.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
          Admin Panel
        </Typography>
        <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
          Керування платформою
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: 18 }}>
          Адмін може модерувати коментарі, додавати жанри та редагувати ігри, які вже є в каталозі.
        </Typography>
      </Box>

      {message && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Paper sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, value: AdminTab) => setActiveTab(value)} variant="scrollable">
          <Tab label="Ігри" value="games" />
          <Tab label="Жанри" value="genres" />
          <Tab label="Коментарі" value="comments" />
        </Tabs>
      </Paper>

      {isLoading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Завантаження адмін-даних...
        </Typography>
      )}

      {activeTab === 'games' && (
        <AdminGamesPanel
          form={form}
          editingId={editingId}
          gameList={gameList}
          genreList={genreList}
          coverFile={coverFile}
          coverPreviewUrl={coverPreviewUrl}
          gameZipFile={gameZipFile}
          isCoverUploading={isCoverUploading}
          isGameUploading={isGameUploading}
          updateField={updateField}
          startCreate={startCreate}
          startEdit={startEdit}
          clearForm={clearForm}
          saveGame={saveGame}
          deleteGame={deleteGame}
          setCoverFile={setCoverFile}
          setCoverPreviewUrl={setCoverPreviewUrl}
          setGameZipFile={setGameZipFile}
          setMessage={setMessage}
        />
      )}

      {activeTab === 'genres' && (
        <AdminGenresPanel
          genreList={genreList}
          newGenreName={newGenreName}
          setNewGenreName={setNewGenreName}
          setMessage={setMessage}
          addGenre={addGenre}
          deleteGenre={deleteGenre}
        />
      )}

      {activeTab === 'comments' && (
        <AdminCommentsPanel
          comments={comments}
          gameTitleById={gameTitleById}
          isLoading={isLoading}
          deleteComment={deleteComment}
        />
      )}
    </Container>
  )
}

export default AdminPage
