import type { AdminGameForm } from './types'

export const emptyGameForm: AdminGameForm = {
  title: '',
  genreId: '',
  description: '',
  players: '1 гравець',
  difficulty: 'Легка',
  coverImage: '',
  rating: '4.0',
  playUrl: '',
}

export const gameAdminPanelHeight = { lg: 740 }

export const scrollPanelSx = {
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(103, 179, 250, 0.75) rgba(255, 255, 255, 0.08)',
  '&::-webkit-scrollbar': { width: 10 },
  '&::-webkit-scrollbar-track': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
  },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: 'rgba(103, 179, 250, 0.75)',
    borderRadius: 999,
    border: '2px solid rgba(255, 255, 255, 0.08)',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    bgcolor: 'primary.light',
  },
} as const
