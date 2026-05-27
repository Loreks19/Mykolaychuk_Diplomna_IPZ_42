export type GameGenre = string

export type Game = {
  id: number
  title: string
  slug: string
  genre: GameGenre
  description: string
  players: string
  difficulty: string
  coverImage: string
  rating: number
  playUrl?: string
}
