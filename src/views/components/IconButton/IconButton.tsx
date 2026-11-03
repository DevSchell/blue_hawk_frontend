import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/classNames'
import './IconButton.css'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Nome acessível: o botão só mostra um ícone */
  label: string
  /** solid: quadrado ultramar com canto cortado; ghost: sem fundo */
  variant?: 'solid' | 'ghost'
}

export function IconButton({ label, variant = 'solid', className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx('icon-button', `icon-button--${variant}`, className)}
      {...props}
    />
  )
}
