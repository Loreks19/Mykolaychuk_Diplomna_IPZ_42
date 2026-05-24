import { type CSSProperties, useMemo, useState } from 'react'
import { games, genres } from './data/games'
import { theme } from './theme'

function App() {
  const [searchText, setSearchText] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return games.filter((game) => {
      const fitsGenre = selectedGenre === 'All' || game.genre === selectedGenre
      const fitsSearch = game.title.toLowerCase().includes(normalizedSearch)

      return fitsGenre && fitsSearch
    })
  }, [searchText, selectedGenre])

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.logoText}>GameHub</p>
          <h1 style={styles.title}>Платформа браузерних ігор</h1>
          <p style={styles.subtitle}>
            Каталог простих ігор, які можна запускати прямо у браузері.
          </p>
        </div>

        <nav style={styles.nav}>
          <a href="#games" style={styles.navLink}>Ігри</a>
          <a href="#genres" style={styles.navLink}>Жанри</a>
          <a href="#footer" style={styles.navLink}>Про проєкт</a>
        </nav>
      </header>

      <main style={styles.main}>
        <section style={styles.searchSection}>
          <div>
            <h2 style={styles.sectionTitle}>Доступні ігри</h2>
            <p style={styles.sectionText}>
              Обери жанр або знайди гру за назвою.
            </p>
          </div>

          <input
            type="search"
            placeholder="Пошук гри..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={styles.searchInput}
          />
        </section>

        <section id="genres" style={styles.filters}>
          {genres.map((genre) => {
            const isActive = selectedGenre === genre

            return (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                style={{
                  ...styles.filterButton,
                  ...(isActive ? styles.activeFilterButton : {}),
                }}
              >
                {genre}
              </button>
            )
          })}
        </section>

        <section id="games" style={styles.gameGrid}>
          {filteredGames.map((game) => (
            <article key={game.id} style={styles.gameCard}>
              <div>
                <span style={styles.genreLabel}>{game.genre}</span>
                <h3 style={styles.gameTitle}>{game.title}</h3>
                <p style={styles.gameDescription}>{game.description}</p>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.playersText}>{game.players}</span>
                <button type="button" style={styles.playButton}>
                  Грати
                </button>
              </div>
            </article>
          ))}
        </section>

        {filteredGames.length === 0 && (
          <p style={styles.emptyText}>За таким запитом ігор поки немає.</p>
        )}
      </main>

      <footer id="footer" style={styles.footer}>
        <p>Browser Game Platform</p>
        <p>Дипломний проєкт з веб-розробки</p>
      </footer>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: theme.colors.background,
    color: theme.colors.text,
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    padding: '32px 8%',
    background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  logoText: {
    margin: `0 0 ${theme.spacing.sm}`,
    color: theme.colors.primary,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: '36px',
  },
  subtitle: {
    maxWidth: '560px',
    margin: `${theme.spacing.md} 0 0`,
    color: theme.colors.mutedText,
    fontSize: '17px',
    lineHeight: 1.5,
  },
  nav: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  navLink: {
    color: theme.colors.text,
    textDecoration: 'none',
    fontWeight: 600,
  },
  main: {
    width: '84%',
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '32px 0 48px',
  },
  searchSection: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    margin: 0,
    fontSize: '28px',
  },
  sectionText: {
    margin: `${theme.spacing.sm} 0 0`,
    color: theme.colors.mutedText,
  },
  searchInput: {
    width: '280px',
    maxWidth: '100%',
    padding: '12px 14px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    fontSize: '15px',
  },
  filters: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  filterButton: {
    padding: '10px 16px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    background: theme.colors.surface,
    color: theme.colors.text,
    cursor: 'pointer',
    fontWeight: 600,
  },
  activeFilterButton: {
    background: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: '#ffffff',
  },
  gameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: theme.spacing.lg,
  },
  gameCard: {
    display: 'flex',
    minHeight: '230px',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.card,
  },
  genreLabel: {
    display: 'inline-block',
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
    fontWeight: 700,
    fontSize: '14px',
  },
  gameTitle: {
    margin: 0,
    fontSize: '22px',
  },
  gameDescription: {
    margin: `${theme.spacing.md} 0 0`,
    color: theme.colors.mutedText,
    lineHeight: 1.5,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  playersText: {
    color: theme.colors.mutedText,
    fontSize: '14px',
  },
  playButton: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: theme.radius.md,
    background: theme.colors.primary,
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 700,
  },
  emptyText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.mutedText,
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: '20px 8%',
    background: theme.colors.surface,
    borderTop: `1px solid ${theme.colors.border}`,
    color: theme.colors.mutedText,
  },
} satisfies Record<string, CSSProperties>

export default App
