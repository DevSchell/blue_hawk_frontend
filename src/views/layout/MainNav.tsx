import './MainNav.css'
import { currentNavItem, NAV_ITEMS } from './navigation'

/** Navegação principal da topbar, ao lado do logo */
export function MainNav() {
  const current = currentNavItem()

  return (
    <nav className="main-nav" aria-label="Principal">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.label}
          className="main-nav__item"
          href={item.href}
          aria-current={item === current ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
