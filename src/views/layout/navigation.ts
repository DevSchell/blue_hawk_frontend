/** Seções do site, na ordem da navegação principal */
export const NAV_ITEMS = [
  { label: 'Wiki', href: '/' },
  { label: 'Loja', href: '/loja' },
  { label: 'Estante', href: '/estante' },
]

/** Item da navegação para o endereço atual; qualquer endereço desconhecido cai na Wiki */
export function currentNavItem(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  return NAV_ITEMS.find((item) => item.href === path) ?? NAV_ITEMS[0]
}
