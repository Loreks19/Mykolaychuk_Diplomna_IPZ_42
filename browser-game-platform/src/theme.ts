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
      paper: '#11182B',
    },
    text: {
      primary: '#F8FBFF',
      secondary: '#A7B4CA',
    },
    divider: 'rgba(159, 219, 240, 0.14)',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: {
      fontSize: '2.6rem',
      fontWeight: 800,
      lineHeight: 1.1,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 800,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
  },
})
