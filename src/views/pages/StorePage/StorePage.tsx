import { useRef } from 'react'
import { BUDGET_LIMIT, useStoreController } from '../../../controllers/useStoreController'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FeedError } from '../../features/boardgames/FeedError'
import { FeaturedCarousel } from '../../features/store/FeaturedCarousel'
import { StoreCard } from '../../features/store/StoreCard'
import { StoreOfferModal } from '../../features/store/StoreOfferModal'
import { cx } from '../../utils/classNames'
import './StorePage.css'

/** Loja, no estilo das vitrines de jogos: destaques, anúncios recentes e os preços mais baixos */
export function StorePage() {
  const c = useStoreController()
  const rowRef = useRef<HTMLDivElement>(null)

  const scrollRow = (direction: 1 | -1) => {
    const row = rowRef.current
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <main className="store-page">
      <Container>
        <header className="store-page__header">
          <h1 className="store-page__title">Loja</h1>
          <p className="store-page__lead">Jogos usados anunciados pela comunidade.</p>
        </header>

        {c.recent.error ? (
          <FeedError error={c.recent.error} onRetry={c.retry} />
        ) : c.recent.loading ? (
          <div className="store-page__skeleton store-page__skeleton--featured" aria-busy="true" />
        ) : c.featured.length === 0 ? (
          <EmptyState icon={<Raven variant="noite" />} title="A Loja está vazia">
            Ninguém anunciou jogos ainda. Anuncie os seus pela estante, em “Meus Jogos”.
          </EmptyState>
        ) : (
          <>
            <FeaturedCarousel offers={c.featured} onOpen={c.openOffer} />

            <section className="store-section" aria-labelledby="store-recent">
              <div className="store-section__head">
                <h2 id="store-recent">Anúncios recentes</h2>
                <div className="store-section__arrows">
                  <button type="button" onClick={() => scrollRow(-1)} aria-label="Voltar anúncios recentes">
                    ‹
                  </button>
                  <button type="button" onClick={() => scrollRow(1)} aria-label="Mais anúncios recentes">
                    ›
                  </button>
                </div>
              </div>
              <div ref={rowRef} className="store-row">
                {c.recent.offers.map((offer) => (
                  <div key={offer.id} className="store-row__item">
                    <StoreCard offer={offer} onOpen={c.openOffer} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="store-section" aria-labelledby="store-cheapest">
          <div className="store-section__head">
            <h2 id="store-cheapest">Preços mais baixos</h2>
          </div>

          <div className="store-filters">
            <label className="visually-hidden" htmlFor="store-search">
              Buscar jogo na Loja
            </label>
            <input
              id="store-search"
              type="search"
              className="store-filters__search"
              placeholder="Buscar jogo…"
              autoComplete="off"
              value={c.search}
              onChange={(e) => c.setSearch(e.target.value)}
            />
            <div className="store-filters__chips" role="group" aria-label="Filtros">
              <button
                type="button"
                aria-pressed={c.budgetOnly}
                className={cx('store-chip', 'store-chip--budget', c.budgetOnly && 'is-on')}
                onClick={c.toggleBudget}
              >
                Até R$ {BUDGET_LIMIT}
              </button>
              {c.categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={c.category === category.name}
                  className={cx('store-chip', c.category === category.name && 'is-on')}
                  onClick={() => c.toggleCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <p className="visually-hidden" aria-live="polite">
            {c.cheapest.loading ? 'Buscando anúncios' : `${c.cheapest.offers.length} anúncios`}
          </p>

          {c.cheapest.error ? (
            <FeedError error={c.cheapest.error} onRetry={c.retry} />
          ) : c.cheapest.loading ? (
            <div className="store-grid" aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="store-page__skeleton" />
              ))}
            </div>
          ) : c.cheapest.offers.length === 0 ? (
            <EmptyState
              icon={<Raven variant="noite" />}
              title="Nenhum anúncio encontrado"
              action={
                c.hasFilters && (
                  <div className="store-page__empty-action">
                    <Button type="button" variant="secondary" onClick={c.clearFilters}>
                      Limpar filtros
                    </Button>
                  </div>
                )
              }
            >
              {c.hasFilters ? 'Nenhum anúncio com esses filtros.' : 'Ninguém anunciou jogos ainda.'}
            </EmptyState>
          ) : (
            <div className="store-grid">
              {c.cheapest.offers.map((offer) => (
                <StoreCard key={offer.id} offer={offer} onOpen={c.openOffer} emphasizePrice />
              ))}
            </div>
          )}
        </section>
      </Container>

      {c.selected && <StoreOfferModal key={c.selected.id} offer={c.selected} onClose={c.closeOffer} />}
    </main>
  )
}
