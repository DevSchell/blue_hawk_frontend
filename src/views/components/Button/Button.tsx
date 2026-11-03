import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/classNames'
import './Button.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary (açafrão) marca a ação principal; secondary (giz) as demais; link é só texto */
  variant?: 'primary' | 'secondary' | 'link'
  fullWidth?: boolean
}

export function Button({ variant = 'primary', fullWidth = false, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('button', `button--${variant}`, fullWidth && 'button--full', className)}
      {...props}
    />
  )
}
