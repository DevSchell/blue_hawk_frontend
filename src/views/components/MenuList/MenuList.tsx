import type { ReactNode } from 'react'
import './MenuList.css'

export function MenuList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label}>
      <ul className="menu-list">{children}</ul>
    </nav>
  )
}

type MenuItemProps = {
  icon: ReactNode
  label: string
  /** Texto curto à direita (ex.: "Em breve") */
  hint?: string
  onClick?: () => void
  /** Leva a outra página (renderiza um link) */
  href?: string
  /** Item visível mas sem ação */
  disabled?: boolean
}

export function MenuItem({ icon, label, hint, onClick, href, disabled = false }: MenuItemProps) {
  const content = (
    <>
      {icon}
      <span>{label}</span>
      {hint && <small className="menu-item__hint">{hint}</small>}
    </>
  )

  if (href) {
    const activePath = window.location.pathname.replace(/\/+$/, '') || '/'
    const fullActive = activePath + window.location.search
    const isCurrent = fullActive === href || (href === activePath && !window.location.search)

    return (
      <li>
        <a
          className="menu-item"
          href={href}
          aria-current={isCurrent ? 'page' : undefined}
          onClick={onClick}
        >
          {content}
        </a>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        className="menu-item"
        aria-disabled={disabled || undefined}
        onClick={disabled ? undefined : onClick}
      >
        {content}
      </button>
    </li>
  )
}
