import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material'
import type { Game } from '../data/games'

type AboutPageProps = {
  games: Game[]
}

function AboutPage({ games }: AboutPageProps) {
  const heroGames = [...games]
    .filter((game) => /^https?:\/\//.test(game.coverImage))
    .sort((firstGame, secondGame) => secondGame.rating - firstGame.rating)
    .slice(0, 2)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          gap: { xs: 4, md: 6 },
          alignItems: 'center',
          mb: { xs: 5, md: 7 },
          minHeight: { md: 430 },
        }}
      >
        <Box>
          <Typography component="h1" variant="h1" sx={{ mb: 2.5, maxWidth: 680 }}>
            GamletLand збирає браузерні ігри в одному місці
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 680, fontSize: { xs: 16, md: 18 }, lineHeight: 1.75 }}>
            Це платформа для швидкого перегляду, запуску та обговорення HTML5-ігор. Користувач може знайти гру,
            додати її в обране, поставити оцінку та поділитися враженнями після проходження.
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 3 }}>
            <Chip icon={<AutoAwesomeIcon />} label="Темний ігровий стиль" color="primary" />
            <Chip icon={<CloudQueueIcon />} label="Каталог у хмарі" variant="outlined" />
          </Stack>
        </Box>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 360, md: 420 },
            border: '1px solid rgba(159, 219, 240, 0.14)',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'rgba(16, 24, 44, 0.76)',
            boxShadow: '0 28px 80px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg, rgba(15, 105, 222, 0.2), transparent 45%), linear-gradient(180deg, transparent, rgba(8, 13, 27, 0.82))',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 28,
              left: 28,
              width: '62%',
              height: 210,
              borderRadius: 1.5,
              border: '1px solid rgba(103, 179, 250, 0.28)',
              background:
                heroGames[0]
                  ? `linear-gradient(180deg, rgba(8, 13, 27, 0.1), rgba(8, 13, 27, 0.86)), url(${heroGames[0].coverImage})`
                  : 'linear-gradient(135deg, rgba(15, 105, 222, 0.5), rgba(8, 13, 27, 0.78)), radial-gradient(circle at top right, rgba(103, 179, 250, 0.32), transparent 38%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.38)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: 24,
              top: 118,
              width: '48%',
              height: 170,
              borderRadius: 1.5,
              border: '1px solid rgba(103, 179, 250, 0.28)',
              background:
                heroGames[1]
                  ? `linear-gradient(180deg, rgba(8, 13, 27, 0.12), rgba(8, 13, 27, 0.84)), url(${heroGames[1].coverImage})`
                  : 'linear-gradient(145deg, rgba(16, 24, 44, 0.95), rgba(10, 78, 168, 0.72)), radial-gradient(circle at 20% 20%, rgba(159, 219, 240, 0.34), transparent 30%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.36)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: 28,
              right: 28,
              bottom: 28,
              p: 2.5,
              borderRadius: 1.5,
              border: '1px solid rgba(159, 219, 240, 0.16)',
              bgcolor: 'rgba(8, 13, 27, 0.82)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
              <Chip label="4 гри" size="small" color="primary" />
              <Chip label="Оцінки" size="small" variant="outlined" />
              <Chip label="Коментарі" size="small" variant="outlined" />
            </Stack>
            <Typography variant="h3" sx={{ mb: 0.75 }}>
              Каталог, що відчувається як ігровий лаунчер
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
              Мінімум зайвих кроків: відкрив сторінку, обрав гру, натиснув запуск.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.85fr 1.15fr' },
          gap: { xs: 3, md: 4 },
          alignItems: 'stretch',
          p: { xs: 3, md: 4 },
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 44,
                height: 44,
                borderRadius: 1.5,
                color: 'primary.light',
                bgcolor: 'rgba(15, 105, 222, 0.16)',
              }}
            >
              <LocationOnIcon />
            </Box>
            <Typography variant="h2">Наше розташування</Typography>
          </Stack>

          <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
            GamletLand має офіс у центрі Києва. Тут можна знайти контактні дані розробника платформи.
          </Typography>

          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 800 }}>Київ, Україна</Typography>
            <Typography color="text.secondary">вул. Хрещатик, 1</Typography>
            <Typography color="text.secondary">Пошта: gamletland.support@gmail.com</Typography>
            <Typography color="text.secondary">Телефон: +380 67 543 49 86</Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            minHeight: { xs: 300, md: 360 },
            borderRadius: 1.5,
            overflow: 'hidden',
            border: '1px solid rgba(103, 179, 250, 0.24)',
            boxShadow: '0 22px 64px rgba(0, 0, 0, 0.28)',
            bgcolor: '#080D1B',
          }}
        >
          <Box
            component="iframe"
            title="Умовне розташування GamletLand на Google Maps"
            src="https://www.google.com/maps?q=Khreshchatyk%201%2C%20Kyiv%2C%20Ukraine&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              minHeight: { xs: 300, md: 360 },
              border: 0,
              filter: 'saturate(0.85) contrast(1.02)',
            }}
          />
        </Box>
      </Paper>
    </Container>
  )
}

export default AboutPage
