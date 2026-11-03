import { cx } from '../../utils/classNames'
import './Avatar.css'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/** Iniciais do nome num quadrado açafrão. Decorativo: o nome deve aparecer em texto ao lado ou no rótulo. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span className={cx('avatar', `avatar--${size}`)} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
