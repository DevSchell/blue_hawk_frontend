import { useEffect, useState } from 'react'
import type { StoreOffer } from '../../../models/store'
import { cx } from '../../utils/classNames'
import { formatPlayers } from '../boardgames/format'
import { formatPrice, formatSince } from './format'
import { StoreCover } from './StoreCard'
import './FeaturedCarousel.css'
import { storeOfferPath } from '../../layout/navigation'

const AUTOPLAY_MS = 5000

type FeaturedCarouselProps = {
  offers: StoreOffer[]
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Destaques no topo da Loja: capa grande + painel de informações, miniaturas embaixo para pular.
 * Passa sozinho a cada 5s; pausa com o mouse em cima, com o foco dentro, ou se o sistema pede menos movimento.
 */
export function FeaturedCarousel({ offers }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = offers.length
  const current = offers[Math.min(index, count - 1)]

  useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion()) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, count])

  if (!current) return null
  const go = (next: number) => setIndex((next + count) % count)
  const { game } = current
  const facts = [
    game.playerNumber ? formatPlayers(game.playerNumber) : null,
    game.playTime ? `${game.playTime} min` : null,
    game.releaseYear ? String(game.releaseYear) : null,
  ].filter(Boolean)

  return (
    <section
      className="featured"
      aria-roledescription="carrossel"
      aria-label="Anúncios em destaque"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      <div className="featured__stage">
        {/* key: troca de slide reinicia a animação de entrada */}
        <div
          key={current.id}
          className="featured__slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${Math.min(index, count - 1) + 1} de ${count}: ${game.name}`}
        >
          <a className="featured__media" href={storeOfferPath(current.id)} tabIndex={-1} aria-hidden="true">
            <StoreCover offer={current} />
          </a>
          <div className="featured__info">
            <span className="featured__kicker">Novo na Loja • {formatSince(current.createdAt)}</span>
            <h3 className="featured__title">{game.name}</h3>
            <div className="featured__tags">
              {game.category && <span className="badge featured__tag">{game.category}</span>}
              {facts.map((fact) => (
                <span key={fact} className="badge featured__fact">
                  {fact}
                </span>
              ))}
            </div>
            <p className="featured__text">{current.description || game.description}</p>
            <div className="featured__buy">
              <span className="featured__price">{formatPrice(current.price)}</span>
              <span className="featured__seller">
                vendido por <b>{current.isMine ? 'você' : current.sellerName}</b>
              </span>
            </div>
            <a className="button button--primary featured__cta" href={storeOfferPath(current.id)}>
              Ver anúncio
            </a>
          </div>
        </div>

        {count > 1 && (
          <>
            <button type="button" className="featured__arrow featured__arrow--prev" onClick={() => go(index - 1)} aria-label="Destaque anterior">
              ‹
            </button>
            <button type="button" className="featured__arrow featured__arrow--next" onClick={() => go(index + 1)} aria-label="Próximo destaque">
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="featured__thumbs" role="tablist" aria-label="Escolher destaque">
          {offers.map((offer, i) => (
            <button
              key={offer.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={offer.game.name}
              className={cx('featured__thumb', i === index && 'is-active', i === index && !paused && 'is-running')}
              onClick={() => go(i)}
            >
              <StoreCover offer={offer} />
              {/* Barra de progresso do autoplay no destaque atual */}
              <span className="featured__progress" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
