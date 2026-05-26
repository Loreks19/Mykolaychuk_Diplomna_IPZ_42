import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import type { AdminComment } from './types'

type AdminCommentsPanelProps = {
  comments: AdminComment[]
  gameTitleById: Map<number, string>
  isLoading: boolean
  deleteComment: (commentId: number) => void
}

function AdminCommentsPanel({ comments, gameTitleById, isLoading, deleteComment }: AdminCommentsPanelProps) {
  return (
    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h2" sx={{ mb: 1 }}>Модерація коментарів</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Тут відображаються всі коментарі з усіх ігор. Видалення прибирає коментар із Supabase.
      </Typography>

      <Stack spacing={2}>
        {comments.map((comment) => (
          <Box key={comment.id}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-start' } }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={gameTitleById.get(comment.game_id) ?? comment.gameTitle} color="primary" size="small" />
                  <Chip label={comment.author_name} variant="outlined" size="small" />
                  <Chip label={new Date(comment.created_at).toLocaleDateString('uk-UA')} variant="outlined" size="small" />
                </Stack>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {comment.text}
                </Typography>
              </Box>
              <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => deleteComment(comment.id)}>
                Видалити
              </Button>
            </Stack>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Stack>

      {!isLoading && comments.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Коментарів поки немає.
        </Typography>
      )}
    </Paper>
  )
}

export default AdminCommentsPanel
