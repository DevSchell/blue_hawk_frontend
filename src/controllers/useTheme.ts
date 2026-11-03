import { useState } from 'react'
import { applyTheme, getCurrentTheme, type Theme } from '../models/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getCurrentTheme)

  const setTheme = (next: Theme) => {
    setThemeState(next)
    applyTheme(next)
  }

  // Lê o tema aplicado na página, e não o estado, para dois cliques seguidos alternarem certo
  const toggleTheme = () => setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark')

  return { theme, setTheme, toggleTheme }
}
