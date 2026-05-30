import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Button,
  Container,
  Stack,
} from '@mui/material'
import useGamePage from '../hooks/useGamePage'
import type { UserRole } from '../types/database'
import type { Game } from '../types/game'
import GameCommentsPanel from './game/GameCommentsPanel'
import GameHero from './game/GameHero'
import GamePlayer from './game/GamePlayer'
import GameRatingPanel from './game/GameRatingPanel'

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
  const {
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
    ratingCount,
    saveRating,
    setCommentText,
    setMessage,
    focusGameFrame,
    toggleGameFullscreen,
    toggleGameMute,
    updateGameVolume,
    userRating,
  } = useGamePage({
    game,
    userId,
    userName,
    userRole,
    avatarUrl,
    isFavorite,
    onToggleFavorite,
  })

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
        Назад до каталогу
      </Button>

      <GameHero
        game={game}
        averageRating={averageRating}
        ratingCount={ratingCount}
        isFavorite={isFavorite}
        onFavoriteClick={handleFavoriteClick}
      />

      <GamePlayer
        title={game.title}
        playUrl={game.playUrl}
        gameShellRef={gameShellRef}
        gameFrameRef={gameFrameRef}
        gameVolume={gameVolume}
        isGameMuted={isGameMuted}
        isGameFullscreen={isGameFullscreen}
        onFrameLoad={handleFrameLoad}
        onFocusFrame={focusGameFrame}
        onToggleMute={toggleGameMute}
        onVolumeChange={updateGameVolume}
        onToggleFullscreen={toggleGameFullscreen}
      />

      <Stack spacing={3}>
        <GameRatingPanel userRating={userRating} onSaveRating={saveRating} />

        <GameCommentsPanel
          comments={comments}
          userId={userId}
          userRole={userRole}
          commentText={commentText}
          message={message}
          isLoading={isLoading}
          onCommentTextChange={setCommentText}
          onCloseMessage={() => setMessage('')}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
        />
      </Stack>
    </Container>
  )
}

export default GamePage
