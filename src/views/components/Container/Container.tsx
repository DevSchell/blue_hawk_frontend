import type { ReactNode } from 'react'
import { cx } from '../../utils/classNames'

/** Coluna central de 1180px com as margens laterais do site (estilo em styles/global.css) */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('container', className)}>{children}</div>
}
