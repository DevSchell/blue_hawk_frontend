import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/classNames'
import './Button.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary (açafrão) marca a ação principal; secondary (giz) as demais; danger fica vermelho no hover; link é só texto */
  variant?: 'primary' | 'secondary' | 'danger' | 'link'
  fullWidth?: boolean
  /** sm: ações compactas dentro de cards, linhas e fichas */
  size?: 'md' | 'sm'
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('button', `button--${variant}`, size === 'sm' && 'button--sm', fullWidth && 'button--full', className)}
      {...props}
    />
  )
}
