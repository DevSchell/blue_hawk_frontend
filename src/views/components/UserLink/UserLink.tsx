import type { MouseEvent, ReactNode } from 'react'
import { openUserProfile } from '../../../models/userProfile'
import { cx } from '../../utils/classNames'
import './UserLink.css'

type UserLinkProps = {
  userId: string | null | undefined
  /** Texto da badge (normalmente o nome) */
  children: ReactNode
  className?: string
  /** {@code plain}: só o nome, que acende no hover (ex.: remetente no chat). Padrão: badge com ícone */
  variant?: 'badge' | 'plain'
}

/**
 * Nome de outro usuário em badge pequena e clicável, que abre o perfil público dele
 * (a pessoa decide o que mostrar nas preferências). Sem id, mostra só o texto.
 */
export function UserLink({ userId, children, className, variant = 'badge' }: UserLinkProps) {
  if (!userId) return <span className={className}>{children}</span>
  const open = (e: MouseEvent) => {
    // Pode estar dentro de algo clicável (card, linha): abre só o perfil
    e.stopPropagation()
    openUserProfile(userId)
  }
  if (variant === 'plain') {
    return (
      <button type="button" className={cx('user-name-link', className)} title="Ver perfil" onClick={open}>
        {children}
      </button>
    )
  }
  return (
    <button type="button" className={cx('user-link', className)} title="Ver perfil" onClick={open}>
      <svg className="user-link__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7Z" fill="currentColor" />
      </svg>
      <span className="user-link__name">{children}</span>
    </button>
  )
}
