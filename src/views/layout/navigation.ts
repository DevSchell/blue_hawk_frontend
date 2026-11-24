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
  /** Configurações: subabas do Meu Perfil */
  settings: '/perfil?aba=preferencias',
  /** Endereço antigo das configurações: redireciona para o Meu Perfil */
  legacySettings: '/configuracoes',
} as const

export const SHELF_PATH = ACCOUNT_ROUTES.shelf
/** Fila de aprovação de jogos (só admin) */
export const REVIEW_PATH = '/aprovacoes'

/** Páginas legais, linkadas no footer */
export const TERMS_PATH = '/termos'
export const PRIVACY_PATH = '/privacidade'

/**
 * O endereço é de uma tela só para quem entrou na conta? (anúncio da Loja, estante, perfil, aprovações)
 * Visitante que clica num link desses recebe a modal de login no lugar, sem trocar de tela.
 */
export function requiresSignIn(to: string) {
  const path = currentPath(to.split(/[?#]/)[0])
  if (path.startsWith(STORE_OFFER_PATH_PREFIX)) return true
  const accountOnly: string[] = [
    ACCOUNT_ROUTES.profile,
    ACCOUNT_ROUTES.shelf,
    ACCOUNT_ROUTES.matches,
    ACCOUNT_ROUTES.legacySettings,
    REVIEW_PATH,
  ]
  return accountOnly.includes(path)
}

/** Endereço atual, sem a barra final ("/" para a raiz) */
export function currentPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

/** Aba "Meus anúncios" da Loja */
export const MY_OFFERS_PATH = '/loja?aba=anuncios'

/** Página de uma partida do Jogue; {@code chat} abre a conversa (mesa ou o id da pessoa) */
export const MATCH_PATH_PREFIX = '/jogue/partida/'
export const matchPath = (matchId: string, chat?: string | null) =>
  `${MATCH_PATH_PREFIX}${encodeURIComponent(matchId)}${chat ? `?chat=${encodeURIComponent(chat)}` : ''}`

/** Página de um jogo da Wiki */
export const GAME_PATH_PREFIX = '/jogo/'
export const gamePath = (gameId: string) => `${GAME_PATH_PREFIX}${encodeURIComponent(gameId)}`

/** Página de um anúncio da Loja (estilo página de produto) */
export const STORE_OFFER_PATH_PREFIX = '/loja/anuncio/'
export const storeOfferPath = (offerId: string) => `${STORE_OFFER_PATH_PREFIX}${encodeURIComponent(offerId)}`

/** Página de uma categoria na Wiki (jogos) e na Loja (anúncios) */
export const CATEGORY_PATH_PREFIX = '/categoria/'
export const categoryPath = (name: string) => `${CATEGORY_PATH_PREFIX}${encodeURIComponent(name)}`
export const STORE_CATEGORY_PATH_PREFIX = '/loja/categoria/'
export const storeCategoryPath = (name: string) => `${STORE_CATEGORY_PATH_PREFIX}${encodeURIComponent(name)}`

/** Id no fim de um caminho com prefixo (ex.: /jogo/{id}); null se o caminho é outro */
export function idFromPath(prefix: string, pathname = window.location.pathname): string | null {
  const path = currentPath(pathname)
  if (!path.startsWith(prefix)) return null
  const id = decodeURIComponent(path.slice(prefix.length))
  return id && !id.includes('/') ? id : null
}

/** Item da topbar para o endereço atual (páginas da conta, aprovações e legais não são um item) */
export function currentNavItem(pathname = window.location.pathname) {
  const path = currentPath(pathname)
  // Páginas de jogo e de categoria ficam na Wiki; páginas de anúncio e de categoria da Loja, na Loja
  if (path.startsWith(GAME_PATH_PREFIX) || path.startsWith(CATEGORY_PATH_PREFIX)) return NAV_ITEMS[0]
  if (path.startsWith(MATCH_PATH_PREFIX)) return NAV_ITEMS[2]
  if (path.startsWith(STORE_OFFER_PATH_PREFIX) || path.startsWith(STORE_CATEGORY_PATH_PREFIX)) return NAV_ITEMS[1]
  return NAV_ITEMS.find((item) => item.href === path)
}
