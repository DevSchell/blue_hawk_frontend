import { cx } from '../../utils/classNames'
import './Brand.css'

/** "Blue Hawk" na fonte da marca */
export function Wordmark({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <span className={cx('wordmark', `wordmark--${size}`, className)}>Blue Hawk</span>
}
