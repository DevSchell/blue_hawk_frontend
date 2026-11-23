/** Seções do site, na ordem da navegação principal (topbar) */
export const NAV_ITEMS = [
  { label: 'Wiki', href: '/' },
  { label: 'Loja', href: '/loja' },
  { label: 'Jogue', href: '/jogue' },
]

/** Matchmaking (item "Jogue" da topbar) */
export const PLAY_PATH = '/jogue'
/** "Minhas partidas" do Jogue */
export const MY_MATCHES_PATH = `${PLAY_PATH}?aba=minhas`

/** Páginas da conta, abertas pelo menu do usuário */
export const ACCOUNT_ROUTES = {
  profile: '/perfil',
  profilePhoto: '/perfil?aba=foto',
  shelf: '/estante',
  /** Endereço antigo de "Minhas Partidas": redireciona para o Jogue */
  matches: '/partidas',
  settings: '/configuracoes',
} as const

export const SHELF_PATH = ACCOUNT_ROUTES.shelf
/** Fila de aprovação de jogos (só admin) */
export const REVIEW_PATH = '/aprovacoes'

/** Páginas legais, linkadas no footer */
export const TERMS_PATH = '/termos'
export const PRIVACY_PATH = '/privacidade'

/** Endereço atual, sem a barra final ("/" para a raiz) */
export function currentPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

/** Item da topbar para o endereço atual (páginas da conta, aprovações e legais não são um item) */
export function currentNavItem(pathname = window.location.pathname) {
  const path = currentPath(pathname)
  return NAV_ITEMS.find((item) => item.href === path)
}
