export type UserRole = 'guest' | 'user' | 'admin'

export type Profile = {
  id: string
  full_name: string
  role: Exclude<UserRole, 'guest'>
  avatar_url: string | null
  created_at: string
}

export type GenreRow = {
  id: number
  name: string
  created_at: string
}

export type GameRow = {
  id: number
  title: string
  slug: string
  genre_id: number | null
  description: string
  players: string
  difficulty: string
  cover_image: string
  play_url: string | null
  rating: number
  created_at: string
}

export type CommentRow = {
  id: number
  game_id: number
  user_id: string
  author_name: string
  author_role: Exclude<UserRole, 'guest'>
  author_avatar_url: string | null
  text: string
  created_at: string
}

export type RatingRow = {
  id: number
  game_id: number
  user_id: string
  value: number
  created_at: string
}
