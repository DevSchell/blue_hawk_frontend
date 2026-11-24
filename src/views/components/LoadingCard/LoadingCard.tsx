import { cx } from '../../utils/classNames'
import './LoadingCard.css'

type LoadingCardProps = {
  /** Texto abaixo do dado, também lido pelo leitor de tela */
  message?: string
  /** Versão menor, para dentro de modais e blocos estreitos */
  compact?: boolean
}

/** Card de carregamento: um D20 com asas voando, no traço do ícone D20 do sistema */
export function LoadingCard({ message = 'Carregando…', compact = false }: LoadingCardProps) {
  return (
    <div className={cx('loading-card', compact && 'loading-card--compact')} role="status" aria-live="polite">
      <svg className="loading-card__art" viewBox="0 0 120 84" aria-hidden="true">
        <ellipse className="loading-card__shadow" cx="60" cy="78" rx="18" ry="3" />
        <g className="loading-card__flyer">
          <path
            className="loading-card__wing loading-card__wing--left"
            d="M44 36C34 22 20 18 8 20c6 6 8 8 4 10 8 3 10 5 6 8 8 2 16 3 26 4Z"
          />
          <path
            className="loading-card__wing loading-card__wing--right"
            d="M76 36c10-14 24-18 36-16-6 6-8 8-4 10-8 3-10 5-6 8-8 2-16 3-26 4Z"
          />
          <g className="loading-card__die">
            <path className="loading-card__die-body" d="M60 21l16.5 9.5v19L60 59l-16.5-9.5v-19z" />
            <path className="loading-card__die-face" d="M60 29.5l8.8 15.2H51.2z" />
            <path
              className="loading-card__die-edge"
              d="M60 21v8.5M76.5 30.5l-7.7 14.2M43.5 30.5l7.7 14.2M60 59l8.8-14.3M60 59l-8.8-14.3"
            />
          </g>
        </g>
      </svg>
      <p className="loading-card__message">{message}</p>
    </div>
  )
}
