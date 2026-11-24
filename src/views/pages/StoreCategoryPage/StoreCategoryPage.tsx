import { useEffect, useMemo, useState } from 'react'
import { useDebouncedValue } from '../../../controllers/useDebouncedValue'
import { BUDGET_LIMIT, sortOffers, STORE_SORTS, type StoreSort } from '../../../controllers/useStoreController'
import { listStoreOffers } from '../../../models/services/storeService'
import type { StoreOffer } from '../../../models/store'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FilterSelect } from '../../components/FilterSelect/FilterSelect'
import { CategoryHeader } from '../../features/boardgames/CategoryHeader'
import { FeedError } from '../../features/boardgames/FeedError'
import { StoreCard } from '../../features/store/StoreCard'
import { categoryPath } from '../../layout/navigation'
import { cx } from '../../utils/classNames'
import '../CategoryPage/CategoryPage.css'
import '../StorePage/StorePage.css'

/** Página de uma categoria na Loja: cabeçalho com a arte, busca, preço até R$ 100, ordenação e os anúncios */
export function StoreCategoryPage({ category }: { category: string }) {
  const [state, setState] = useState<{ offers: StoreOffer[] | null; error: unknown }>({ offers: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim().toLowerCase(), 250)
  const [budgetOnly, setBudgetOnly] = useState(false)
  const [sort, setSort] = useState<StoreSort>('price-asc')

  useEffect(() => {
    const controller = new AbortController()
    listStoreOffers({ sort: 'price', category, limit: 100 }, controller.signal)
      .then((offers) => setState({ offers, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ offers: [], error })
      })
    return () => controller.abort()
  }, [category, attempt])

  const offers = useMemo(() => {
    const filtered = (state.offers ?? []).filter(
      (o) =>
        (!query || o.game.name.toLowerCase().includes(query)) && (!budgetOnly || Number(o.price) <= BUDGET_LIMIT),
    )
    return sortOffers(filtered, sort)
  }, [state.offers, query, budgetOnly, sort])

  const total = state.offers?.length ?? null
  const hasFilters = Boolean(query || budgetOnly)

  return (
    <>
      <CategoryHeader
        name={category}
        section={{ label: 'Loja', href: '/loja' }}
        title={category}
        lead={
          <>
            {total === null
              ? 'Exemplares usados desta categoria.'
              : total === 1
                ? '1 exemplar à venda nesta categoria.'
                : `${total} exemplares à venda nesta categoria.`}{' '}
            <a className="category-page__link" href={categoryPath(category)}>
              Conhecer os jogos na Wiki
            </a>
          </>
        }
        backFallback="/loja"
      />

      <main className="category-page store-category-page">
        <Container>
          <div className="category-page__tools store-filters">
            <label className="visually-hidden" htmlFor="busca-loja-categoria">
              Buscar em {category}
            </label>
            <input
              id="busca-loja-categoria"
              type="search"
              className="store-filters__search"
              placeholder={`Buscar em ${category}…`}
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              aria-pressed={budgetOnly}
              className={cx('store-chip', 'store-chip--budget', budgetOnly && 'is-on')}
              onClick={() => setBudgetOnly((v) => !v)}
            >
              Até R$ {BUDGET_LIMIT}
            </button>
            <div className="category-page__selects">
              <FilterSelect<StoreSort>
                label="Ordenar"
                ariaLabel="Ordenar anúncios por"
                value={sort}
                options={STORE_SORTS}
                onChange={setSort}
              />
            </div>
          </div>

          {state.error ? (
            <FeedError error={state.error} onRetry={() => setAttempt((n) => n + 1)} />
          ) : state.offers === null ? (
            <div className="store-grid" aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="store-page__skeleton" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              icon={<Raven variant="noite" />}
              title={hasFilters ? 'Nenhum anúncio com esses filtros' : `Nenhum jogo de ${category.toLowerCase()} à venda`}
              action={
                hasFilters && (
                  <div className="store-page__empty-action">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSearch('')
                        setBudgetOnly(false)
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )
              }
            >
              {hasFilters ? 'Tente outra busca ou tire o filtro de preço.' : 'Quando alguém anunciar, aparece aqui.'}
            </EmptyState>
          ) : (
            <div className="store-grid">
              {offers.map((offer) => (
                <StoreCard key={offer.id} offer={offer} emphasizePrice />
              ))}
            </div>
          )}
        </Container>
      </main>
    </>
  )
}
