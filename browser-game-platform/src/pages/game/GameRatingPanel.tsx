import {
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material'

type GameRatingPanelProps = {
  userRating: number | null
  onSaveRating: (value: number | null) => void | Promise<void>
}

function GameRatingPanel({ userRating, onSaveRating }: GameRatingPanelProps) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Твоя оцінка
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Поділись враженням від гри: твоя оцінка допоможе іншим швидше знайти найцікавіші проєкти.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Rating value={userRating} onChange={(_, value) => onSaveRating(value)} />
        <Typography color="text.secondary">
          {userRating ? `Ти оцінив гру на ${userRating}` : 'Ти ще не оцінював цю гру'}
        </Typography>
      </Stack>
    </Paper>
  )
}

export default GameRatingPanel
