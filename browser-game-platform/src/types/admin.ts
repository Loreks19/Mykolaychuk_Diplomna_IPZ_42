import type { CommentRow, GameRow, UserRole } from './database'
import type { Game } from './game'

export type AdminTab = 'games' | 'genres' | 'comments'

export type EditableGame = Game & {
  genreId: GameRow['genre_id']
}

export type AdminComment = CommentRow & {
  gameTitle: string
}

export type AdminGameForm = {
  title: string
  genreId: string
  description: string
  players: string
  difficulty: string
  coverImage: string
  rating: string
  playUrl: string
}

export type AdminPageProps = {
  userRole: UserRole
  onCatalogChange: () => void | Promise<void>
}
