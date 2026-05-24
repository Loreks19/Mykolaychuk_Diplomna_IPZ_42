import InfoIcon from '@mui/icons-material/Info'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import StorageIcon from '@mui/icons-material/Storage'
import { Box, Container, Paper, Stack, Typography } from '@mui/material'

const aboutItems = [
  {
    title: 'Каталог браузерних ігор',
    text: 'Платформа збирає HTML5-ігри в одному місці, щоб користувач міг швидко знайти гру за жанром і запустити її без встановлення.',
    icon: <SportsEsportsIcon />,
  },
  {
    title: 'Інтеграція Construct 2',
    text: 'Ігри, експортовані з Construct 2 у HTML5-форматі, можна додавати до платформи і відкривати прямо у браузері через сторінку гри.',
    icon: <InfoIcon />,
  },
  {
    title: 'Готовність до бази даних',
    text: 'Frontend уже має структуру для каталогу, сторінок і адмін-панелі. У майбутньому ці дані можна зберігати в Supabase.',
    icon: <StorageIcon />,
  },
]

function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper sx={{ p: { xs: 3, md: 5 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography color="primary.light" sx={{ mb: 1, fontWeight: 700 }}>
          About GamletLand
        </Typography>
        <Typography component="h1" variant="h1" sx={{ mb: 2 }}>
          Про платформу
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 780, fontSize: 18, lineHeight: 1.7 }}>
          GamletLand - це навчальний веб-проєкт у форматі платформи для браузерних
          HTML5-ігор. Його головна ідея полягає в тому, щоб користувач міг переглядати
          каталог ігор, відкривати сторінку конкретної гри та запускати її прямо у браузері.
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        {aboutItems.map((item) => (
          <Paper key={item.title} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Box sx={{ color: 'primary.light' }}>{item.icon}</Box>
              <Typography variant="h3">{item.title}</Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.text}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Можливості, які плануються
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          У наступних етапах проєкт можна розширити авторизацією користувачів,
          коментарями, оцінками, обраними іграми, ролями користувачів та повноцінною
          адмін-панеллю для керування контентом. Для збереження даних буде зручно
          використати Supabase, який дає базу даних, авторизацію та сховище файлів.
        </Typography>
      </Paper>
    </Container>
  )
}

export default AboutPage
