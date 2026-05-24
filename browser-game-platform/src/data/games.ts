export type GameGenre = 'Action' | 'Arcade' | 'Puzzle' | 'Strategy'

export type Game = {
  id: number
  title: string
  slug: string
  genre: GameGenre
  description: string
  players: string
  difficulty: string
  playUrl?: string
}

export const games: Game[] = [
  {
    id: 1,
    title: 'Shooter',
    slug: 'shooter',
    genre: 'Action',
    description: 'Браузерна гра, у якій гравець керує персонажем і бореться з ворогами.',
    players: '1 гравець',
    difficulty: 'Середня',
    playUrl: '/games/shooter/index.html',
  },
  {
    id: 2,
    title: 'Space Runner',
    slug: 'space-runner',
    genre: 'Arcade',
    description: 'Швидка аркадна гра, де потрібно ухилятися від перешкод у космосі.',
    players: '1 гравець',
    difficulty: 'Легка',
  },
  {
    id: 3,
    title: 'Puzzle Blocks',
    slug: 'puzzle-blocks',
    genre: 'Puzzle',
    description: 'Логічна гра з блоками для тренування уважності та планування.',
    players: '1 гравець',
    difficulty: 'Легка',
  },
  {
    id: 4,
    title: 'City Builder',
    slug: 'city-builder',
    genre: 'Strategy',
    description: 'Спокійна стратегія, у якій потрібно розвивати власне місто.',
    players: '1 гравець',
    difficulty: 'Середня',
  },
]

export const genres: Array<GameGenre | 'All'> = ['All', 'Action', 'Arcade', 'Puzzle', 'Strategy']
