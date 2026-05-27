import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import {
  Box,
  IconButton,
  Paper,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import type { RefObject } from 'react'

type GamePlayerProps = {
  title: string
  playUrl?: string
  gameShellRef: RefObject<HTMLDivElement | null>
  gameFrameRef: RefObject<HTMLIFrameElement | null>
  gameVolume: number
  isGameMuted: boolean
  isGameFullscreen: boolean
  onFrameLoad: () => void
  onFocusFrame: () => void
  onToggleMute: () => void
  onVolumeChange: (event: Event, value: number | number[]) => void
  onToggleFullscreen: () => void | Promise<void>
}

function GamePlayer({
  title,
  playUrl,
  gameShellRef,
  gameFrameRef,
  gameVolume,
  isGameMuted,
  isGameFullscreen,
  onFrameLoad,
  onFocusFrame,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
}: GamePlayerProps) {
  return (
    <Paper
      ref={gameShellRef}
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: 3,
        bgcolor: '#050815',
        borderColor: 'rgba(103, 179, 250, 0.28)',
        boxShadow: '0 24px 80px rgba(15, 105, 222, 0.2)',
        '&:fullscreen': {
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {playUrl ? (
        <>
          <Box
            component="iframe"
            ref={gameFrameRef}
            title={title}
            src={playUrl}
            allow="autoplay; fullscreen; gamepad; pointer-lock"
            allowFullScreen
            tabIndex={0}
            onLoad={onFrameLoad}
            onMouseEnter={onFocusFrame}
            onPointerDown={onFocusFrame}
            sx={{
              display: 'block',
              width: '100%',
              height: { xs: 420, md: 640 },
              flex: 1,
              border: 0,
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
          />

          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              position: 'absolute',
              left: { xs: 10, md: 18 },
              bottom: { xs: 10, md: 18 },
              zIndex: 2,
              alignItems: 'center',
              px: 1,
              py: 0.75,
              bgcolor: 'rgba(5, 8, 21, 0.5)',
              borderRadius: 999,
              boxShadow: '0 16px 42px rgba(0, 0, 0, 0.45), 0 0 24px rgba(25, 118, 210, 0.22)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <Tooltip title={isGameMuted ? 'Увімкнути звук' : 'Вимкнути звук'}>
              <IconButton
                size="small"
                onClick={onToggleMute}
                aria-label={isGameMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                sx={{
                  width: 36,
                  height: 36,
                  color: '#EAF4FF',
                  bgcolor: 'rgba(25, 118, 210, 0.72)',
                  border: '1px solid rgba(103, 179, 250, 0.82)',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                }}
              >
                {isGameMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Slider
              value={isGameMuted ? 0 : gameVolume}
              min={0}
              max={100}
              onChange={onVolumeChange}
              aria-label="Гучність гри"
              sx={{
                width: { xs: 96, sm: 132 },
                color: 'primary.light',
                '& .MuiSlider-rail': { opacity: 0.5 },
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  boxShadow: '0 0 0 4px rgba(103, 179, 250, 0.18)',
                },
              }}
            />

            <Typography variant="caption" sx={{ minWidth: 34, textAlign: 'center', color: '#EAF4FF', fontWeight: 800 }}>
              {isGameMuted ? 0 : gameVolume}%
            </Typography>
          </Stack>

          <Tooltip title={isGameFullscreen ? 'Вийти з повного екрана' : 'На весь екран'}>
            <IconButton
              size="small"
              onClick={onToggleFullscreen}
              aria-label={isGameFullscreen ? 'Вийти з повного екрана' : 'На весь екран'}
              sx={{
                position: 'absolute',
                right: { xs: 10, md: 18 },
                bottom: { xs: 10, md: 18 },
                zIndex: 2,
                width: 52,
                height: 52,
                color: '#EAF4FF',
                bgcolor: 'rgba(5, 8, 21, 0.5)',
                border: '1px solid rgba(103, 179, 250, 0.82)',
                '& .MuiSvgIcon-root': {
                  fontSize: 30,
                },
                boxShadow: '0 16px 42px rgba(0, 0, 0, 0.45), 0 0 24px rgba(25, 118, 210, 0.22)',
                backdropFilter: 'blur(14px)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.58)',
                },
              }}
            >
              {isGameFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Гра ще не завантажена
          </Typography>
          <Typography color="text.secondary">
            Після завантаження архіву гри в адмін-панелі тут з'явиться вбудований запуск у браузері.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default GamePlayer
