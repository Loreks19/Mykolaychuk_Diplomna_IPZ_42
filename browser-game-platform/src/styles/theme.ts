import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0F69DE',
      light: '#67B3FA',
      dark: '#0A4EA8',
    },
    secondary: {
      main: '#9FDBF0',
    },
    background: {
      default: '#0B1020',
      paper: '#10182C',
    },
    text: {
      primary: '#F8FBFF',
      secondary: '#A7B4CA',
    },
    divider: 'rgba(159, 219, 240, 0.14)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", Arial, sans-serif',
    button: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    h1: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontSize: '2.95rem',
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontSize: '2rem',
      fontWeight: 800,
      lineHeight: 1.08,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: '"Space Grotesk", "Inter", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          overflowY: 'scroll',
          scrollbarGutter: 'stable',
          scrollbarColor: '#2568B8 #080D1B',
          scrollbarWidth: 'thin',
        },
        body: {
          backgroundColor: '#0B1020',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overflowX: 'hidden',
        },
        '*::-webkit-scrollbar': {
          width: 12,
        },
        '*::-webkit-scrollbar-track': {
          background: '#080D1B',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(180deg, #1B7AF2, #0A4EA8)',
          border: '3px solid #080D1B',
          borderRadius: 999,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: 'linear-gradient(180deg, #67B3FA, #0F69DE)',
        },
        '::selection': {
          backgroundColor: 'rgba(103, 179, 250, 0.32)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
          minHeight: 42,
          paddingInline: 18,
          transition: 'transform 180ms ease, border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #1B7AF2 0%, #67B3FA 100%)',
          boxShadow: '0 14px 34px rgba(15, 105, 222, 0.28)',
          '&:hover': {
            boxShadow: '0 18px 44px rgba(15, 105, 222, 0.38)',
          },
        },
        outlined: {
          borderColor: 'rgba(103, 179, 250, 0.36)',
          backgroundColor: 'rgba(103, 179, 250, 0.04)',
          '&:hover': {
            borderColor: '#67B3FA',
            backgroundColor: 'rgba(103, 179, 250, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          letterSpacing: 0,
        },
        colorPrimary: {
          backgroundColor: 'rgba(15, 105, 222, 0.18)',
          color: '#D8ECFF',
          border: '1px solid rgba(103, 179, 250, 0.28)',
        },
        outlined: {
          borderColor: 'rgba(159, 219, 240, 0.2)',
          color: '#B9C8DE',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0))',
          boxShadow: '0 22px 70px rgba(0, 0, 0, 0.26)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(159, 219, 240, 0.13)',
          backgroundColor: '#10182C',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.035)',
          },
        },
      },
    },
  },
})
