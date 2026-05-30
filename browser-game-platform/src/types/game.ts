import type { GameRow } from './database'

export type GameGenre = string

export type Game = Omit<GameRow, 'genre_id' | 'cover_image' | 'play_url' | 'created_at'> & {
  genre: GameGenre
  coverImage: GameRow['cover_image']
  playUrl?: NonNullable<GameRow['play_url']>
}
