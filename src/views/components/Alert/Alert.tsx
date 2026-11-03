import type { ReactNode } from 'react'
import { cx } from '../../utils/classNames'
import './Alert.css'

type AlertProps = {
  title: string
  children: ReactNode
  /** info (ultramar) para avisos; warn (açafrão) para problemas */
  tone?: 'info' | 'warn'
  /** Ação opcional, alinhada à direita (ex.: um Button) */
  action?: ReactNode
  /** sm: versão compacta, para formulários e modais */
  size?: 'md' | 'sm'
}

export function Alert({ title, children, tone = 'info', action, size = 'md' }: AlertProps) {
  return (
    <div className={cx('alert', `alert--${tone}`, size === 'sm' && 'alert--sm')} role={tone === 'warn' ? 'alert' : 'status'}>
      <b className="alert__title">{title}</b>
      <span className="alert__text">{children}</span>
      {action}
    </div>
  )
}
