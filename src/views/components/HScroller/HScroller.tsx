import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cx } from '../../utils/classNames'
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons/Icons'
import './HScroller.css'

type HScrollerProps = {
  /** Nome da fileira para leitor de tela (ex.: "Anúncios recentes") */
  label: string
  /**
   * Largura de cada coluna (grid-auto-columns). Padrão: cards de ~1/4 da linha, nunca menores que 220px.
   * Use `minmax(200px, 1fr)` para os itens dividirem a linha quando couberem.
   */
  columns?: string
  className?: string
  children: ReactNode
}

/**
 * Fileira com rolagem lateral (padrão do sistema): sem a barra nativa, com sombra no lado que tem mais itens,
 * setas sobrepostas que aparecem só quando há para onde ir e uma barrinha de progresso embaixo.
 */
export function HScroller({ label, columns, className, children }: HScrollerProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [state, setState] = useState({ left: false, right: false, thumb: 1, offset: 0 })

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setState({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < max - 2,
      thumb: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1,
      offset: el.scrollWidth ? el.scrollLeft / el.scrollWidth : 0,
    })
  }, [])

  const count = Children.count(children)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [update, count])

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' })
  }

  const overflows = state.left || state.right

  return (
    <div
      className={cx('h-scroller', state.left && 'has-more-left', state.right && 'has-more-right', className)}
      style={columns ? ({ '--hs-columns': columns } as CSSProperties) : undefined}
    >
      <ul ref={trackRef} className="h-scroller__track" aria-label={label}>
        {Children.map(children, (child, i) => (
          <li key={isValidElement(child) && child.key != null ? child.key : i} className="h-scroller__item">
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="h-scroller__arrow h-scroller__arrow--prev"
        onClick={() => scrollBy(-1)}
        aria-label={`Voltar em ${label}`}
        tabIndex={state.left ? 0 : -1}
        aria-hidden={!state.left}
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        className="h-scroller__arrow h-scroller__arrow--next"
        onClick={() => scrollBy(1)}
        aria-label={`Mais em ${label}`}
        tabIndex={state.right ? 0 : -1}
        aria-hidden={!state.right}
      >
        <ChevronRightIcon />
      </button>

      {overflows && (
        <div className="h-scroller__progress" aria-hidden="true">
          <span
            style={{ width: `${state.thumb * 100}%`, transform: `translateX(${(state.offset / state.thumb) * 100}%)` }}
          />
        </div>
      )}
    </div>
  )
}
