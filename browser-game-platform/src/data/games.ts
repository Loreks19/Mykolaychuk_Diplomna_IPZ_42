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

export const games: Game[] = [
  {
    id: 1,
    title: 'Shooter',
    slug: 'shooter',
    genre: 'Екшн',
    description: 'Браузерна гра, у якій гравець керує персонажем і бореться з ворогами.',
    players: '1 гравець',
    difficulty: 'Середня',
    coverImage: '/games_images/shooter.png',
    rating: 4.6,
    playUrl: '/games/shooter/index.html',
  },
  {
    id: 2,
    title: 'Space Runner',
    slug: 'space-runner',
    genre: 'Аркада',
    description: 'Швидка аркадна гра, де потрібно ухилятися від перешкод у космосі.',
    players: '1 гравець',
    difficulty: 'Легка',
    coverImage: '/games_images/space.jpg',
    rating: 4.2,
  },
  {
    id: 3,
    title: 'Puzzle Blocks',
    slug: 'puzzle-blocks',
    genre: 'Головоломка',
    description: 'Логічна гра з блоками для тренування уважності та планування.',
    players: '1 гравець',
    difficulty: 'Легка',
    coverImage: '/games_images/drive.png',
    rating: 4.0,
  },
  {
    id: 4,
    title: 'City Builder',
    slug: 'city-builder',
    genre: 'Стратегія',
    description: 'Спокійна стратегія, у якій потрібно розвивати власне місто.',
    players: '1 гравець',
    difficulty: 'Середня',
    coverImage: '/games_images/build.png',
    rating: 4.4,
  },
]

export const favoriteGames = games.filter((game) => game.id === 1 || game.id === 2)

export const genres: GameGenre[] = ['Екшн', 'Аркада', 'Головоломка', 'Стратегія']
