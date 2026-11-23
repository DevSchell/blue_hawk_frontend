/** Seções do site, na ordem da navegação principal (topbar) */
export const NAV_ITEMS = [
  { label: 'Wiki', href: '/' },
  { label: 'Loja', href: '/loja' },
  { label: 'Jogue', href: '/jogue' },
]

/** Matchmaking (item "Jogue" da topbar) */
export const PLAY_PATH = '/jogue'

/** Páginas fora da topbar, abertas pelo menu do usuário */
export const SHELF_PATH = '/estante'
/** Fila de aprovação de jogos (só admin) */
export const REVIEW_PATH = '/aprovacoes'

/** Páginas legais, linkadas no footer */
export const TERMS_PATH = '/termos'
export const PRIVACY_PATH = '/privacidade'

/** Páginas que não marcam nenhum item da topbar */
const OFF_NAV_PATHS = [SHELF_PATH, REVIEW_PATH, TERMS_PATH, PRIVACY_PATH]

/** Caminho atual sem a barra final ("/" para a raiz) */
export function currentPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

export function isReviewPath(pathname = window.location.pathname) {
  return currentPath(pathname) === REVIEW_PATH
}

/**
 * Item da topbar para o endereço atual. Páginas do menu do usuário (estante, aprovações) não marcam
 * nenhum item; qualquer outro endereço desconhecido cai na Wiki.
 */
export function currentNavItem(pathname = window.location.pathname) {
  const path = currentPath(pathname)
  if (OFF_NAV_PATHS.includes(path)) return null
  return NAV_ITEMS.find((item) => item.href === path) ?? NAV_ITEMS[0]
}
