export type Theme = 'dark' | 'light'

/** Mesma chave lida pelo script em index.html, que aplica o tema antes do primeiro render */
const THEME_KEY = 'bluehawk.theme'

export function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** Aplica o tema na página e guarda a escolha */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Sem storage (aba anônima, bloqueio): o tema vale só até recarregar
  }
}
