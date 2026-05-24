export type Game = {
  id: number
  title: string
  genre: string
  description: string
  players: string
}

export const games: Game[] = [
  {
    id: 1,
    title: 'Space Runner',
    genre: 'Arcade',
    description: 'Швидка аркадна гра, де потрібно ухилятися від перешкод у космосі.',
    players: '1 гравець',
  },
  {
    id: 2,
    title: 'Puzzle Blocks',
    genre: 'Puzzle',
    description: 'Логічна гра з блоками для тренування уважності та планування.',
    players: '1 гравець',
  },
  {
    id: 3,
    title: 'Battle Arena',
    genre: 'Action',
    description: 'Динамічна гра з короткими боями та системою очок.',
    players: '2 гравці',
  },
  {
    id: 4,
    title: 'City Builder',
    genre: 'Strategy',
    description: 'Спокійна стратегія, у якій потрібно розвивати власне місто.',
    players: '1 гравець',
  },
]

export const genres = ['All', 'Arcade', 'Puzzle', 'Action', 'Strategy']
