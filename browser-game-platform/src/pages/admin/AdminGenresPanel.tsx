import DeleteIcon from '@mui/icons-material/Delete'
import { Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'
import type { GenreRow } from '../../types/database'

type AdminGenresPanelProps = {
  genreList: GenreRow[]
  newGenreName: string
  setNewGenreName: (name: string) => void
  setMessage: (message: string) => void
  addGenre: () => void
  deleteGenre: (genreId: number) => void
}

function AdminGenresPanel({
  genreList,
  newGenreName,
  setNewGenreName,
  setMessage,
  addGenre,
  deleteGenre,
}: AdminGenresPanelProps) {
  return (
    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h2" sx={{ mb: 2 }}>Жанри</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Новий жанр"
          value={newGenreName}
          onChange={(event) => {
            setNewGenreName(event.target.value)
            setMessage('')
          }}
          fullWidth
        />
        <Button variant="contained" onClick={addGenre} sx={{ minWidth: 160 }}>
          Додати
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {genreList.map((genre) => (
          <Chip
            key={genre.id}
            label={genre.name}
            color="primary"
            onDelete={() => deleteGenre(genre.id)}
            deleteIcon={<DeleteIcon />}
          />
        ))}
      </Stack>
    </Paper>
  )
}

export default AdminGenresPanel
