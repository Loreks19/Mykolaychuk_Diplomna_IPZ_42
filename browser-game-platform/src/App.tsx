import { CssBaseline, ThemeProvider } from '@mui/material'
import { useState } from 'react'
import AppLayout from './components/AppLayout'
import type { Game } from './data/games'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import { theme } from './theme'

function App() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout onHomeClick={() => setSelectedGame(null)}>
        {selectedGame ? (
          <GamePage game={selectedGame} onBack={() => setSelectedGame(null)} />
        ) : (
          <HomePage onOpenGame={setSelectedGame} />
        )}
      </AppLayout>
    </ThemeProvider>
  )
}

export default App
