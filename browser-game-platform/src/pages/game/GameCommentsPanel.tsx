import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { CommentRow, UserRole } from '../../types/database'

type GameCommentsPanelProps = {
  comments: CommentRow[]
  userId: string | null
  userRole: UserRole
  commentText: string
  message: string
  isLoading: boolean
  onCommentTextChange: (value: string) => void
  onCloseMessage: () => void
  onAddComment: () => void | Promise<void>
  onDeleteComment: (commentId: number) => void | Promise<void>
}

function GameCommentsPanel({
  comments,
  userId,
  userRole,
  commentText,
  message,
  isLoading,
  onCommentTextChange,
  onCloseMessage,
  onAddComment,
  onDeleteComment,
}: GameCommentsPanelProps) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Коментарі
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Розкажи, що сподобалось, поділись порадою або залиш перше враження після проходження.
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={onCloseMessage}>
          {message}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Написати коментар"
          value={commentText}
          onChange={(event) => onCommentTextChange(event.target.value)}
          multiline
          minRows={2}
        />
        <Button variant="contained" endIcon={<SendIcon />} onClick={onAddComment} sx={{ alignSelf: { md: 'flex-start' } }}>
          Додати
        </Button>
      </Stack>

      {isLoading && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Завантаження коментарів...
        </Typography>
      )}

      <Stack spacing={2}>
        {comments.map((comment) => (
          <Box key={comment.id}>
            <Stack direction="row" spacing={2}>
              <Avatar src={comment.author_avatar_url ?? undefined} sx={{ bgcolor: comment.author_role === 'admin' ? '#D7A721' : 'primary.main' }}>
                {comment.author_name[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700 }}>{comment.author_name}</Typography>
                    {comment.author_role === 'admin' && (
                      <Chip
                        icon={<WorkspacePremiumIcon />}
                        label="Адмін"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(215, 167, 33, 0.18)',
                          color: '#FFD66B',
                          border: '1px solid rgba(255, 214, 107, 0.45)',
                          '& .MuiChip-icon': { color: '#FFD66B' },
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(comment.created_at).toLocaleDateString('uk-UA')}
                  </Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }}>
                  {comment.text}
                </Typography>
                {(comment.user_id === userId || userRole === 'admin') && (
                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDeleteComment(comment.id)}
                    sx={{ mt: 1 }}
                  >
                    Видалити
                  </Button>
                )}
              </Box>
            </Stack>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Stack>

      {!isLoading && comments.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Коментарів поки немає. Можеш бути першим.
        </Typography>
      )}
    </Paper>
  )
}

export default GameCommentsPanel
