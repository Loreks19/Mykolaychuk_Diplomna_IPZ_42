export const theme = {
  colors: {
    background: '#f4f6fb',
    surface: '#ffffff',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    text: '#172033',
    mutedText: '#64748b',
    border: '#dbe3ef',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },

  shadows: {
    card: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
}

export type AppTheme = typeof theme
