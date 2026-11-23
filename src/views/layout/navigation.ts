/** Seções do site, na ordem da navegação principal */
export const NAV_ITEMS = [
  { label: 'Wiki', href: '/' },
  { label: 'Loja', href: '/loja' },
  { label: 'Estante', href: '/estante' },
]

/** Páginas da conta, abertas pelo menu do usuário */
export const ACCOUNT_ROUTES = {
  profile: '/perfil',
  profilePhoto: '/perfil?aba=foto',
  shelf: '/estante',
  matches: '/partidas',
  settings: '/configuracoes',
} as const

/** Endereço atual, sem a barra final */
export function currentPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

/** Item da navegação principal para o endereço atual (as páginas da conta não são um item) */
export function currentNavItem(pathname = window.location.pathname) {
  const path = currentPath(pathname)
  return NAV_ITEMS.find((item) => item.href === path)
}
