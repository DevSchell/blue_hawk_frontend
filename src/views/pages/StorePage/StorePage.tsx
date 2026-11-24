import {
  BUDGET_LIMIT,
  STORE_SORTS,
  useStoreController,
  type StoreSort,
  type StoreTab,
} from '../../../controllers/useStoreController'
import { openChatInbox } from '../../../models/chatInbox'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FilterSelect } from '../../components/FilterSelect/FilterSelect'
import { MultiSelect } from '../../components/FilterSelect/MultiSelect'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { Hero } from '../../components/Hero/Hero'
import { StoreScene } from '../../components/Brand/StoreScene'
import { formatPrice } from '../../features/store/format'
import { HScroller } from '../../components/HScroller/HScroller'
import { PillTabs } from '../../components/PillTabs/PillTabs'
import { CategoryTiles } from '../../features/boardgames/CategoryTiles'
import { FeedError } from '../../features/boardgames/FeedError'
import { FeaturedCarousel } from '../../features/store/FeaturedCarousel'
import { NegotiationList } from '../../features/store/NegotiationList'
import { StoreCard } from '../../features/store/StoreCard'
import { ACCOUNT_ROUTES, storeCategoryPath } from '../../layout/navigation'
import { cx } from '../../utils/classNames'
import { navigate } from '../../layout/router'
import './StorePage.css'

const TABS: { id: StoreTab; label: string }[] = [
  { id: 'vitrine', label: 'Vitrine' },
  { id: 'anuncios', label: 'Meus anúncios' },
  { id: 'negociacoes', label: 'Minhas negociações' },
]

/** Loja, no estilo das vitrines de jogos: destaques, recentes e explorar; e as abas da conta */
export function StorePage() {
  const c = useStoreController()
  const total = c.explore.loading ? null : c.explore.offers.length
  const cheapest =
    c.explore.loading || c.explore.offers.length === 0
      ? null
      : Math.min(...c.explore.offers.map((o) => Number(o.price)))

  return (
    <>
      <Hero
        title="Clássicos com história."
        lead="Jogos usados anunciados pela comunidade. Conheça o exemplar e converse com quem vende."
        art={<StoreScene />}
      >
        <ul className="store-hero__stats" aria-label="A Loja agora">
          <li>
            <b>{total ?? '–'}</b>
            <span>{total === 1 ? 'anúncio ativo' : 'anúncios ativos'}</span>
          </li>
          <li>
            <b>{cheapest === null ? '–' : formatPrice(cheapest)}</b>
            <span>a partir de</span>
          </li>
          <li>
            <a className="store-hero__cta" href="/estante">
              Anunciar um jogo seu
            </a>
          </li>
        </ul>
      </Hero>

      <main className="store-page">
        <Container>
          {c.signedIn && <PillTabs<StoreTab> label="Seções da Loja" tabs={TABS} value={c.tab} onChange={c.selectTab} />}

          {c.tab === 'anuncios' ? (
            <section aria-label="Meus anúncios">
              {c.mine.error ? (
                <FeedError error={c.mine.error} onRetry={c.retry} />
              ) : c.mine.loading ? (
                <LoadingCard message="Buscando seus anúncios…" />
              ) : c.mine.offers.length === 0 ? (
                <EmptyState
                  icon={<Raven variant="noite" />}
                  title="Você não tem anúncios na Loja"
                  action={
                    <div className="store-page__empty-action">
                      <Button type="button" onClick={() => navigate(ACCOUNT_ROUTES.shelf)}>
                        Anunciar pela estante
                      </Button>
                    </div>
                  }
                >
                  Escolha um jogo em “Meus Jogos” e use “Anunciar venda”.
                </EmptyState>
              ) : (
                <div className="store-grid">
                  {c.mine.offers.map((offer) => (
                    <StoreCard key={offer.id} offer={offer} emphasizePrice />
                  ))}
                </div>
              )}
            </section>
          ) : c.tab === 'negociacoes' ? (
            <section aria-label="Minhas negociações">
              {c.negotiations.error ? (
                <FeedError error={c.negotiations.error} onRetry={c.retry} />
              ) : c.negotiations.loading ? (
                <LoadingCard message="Buscando suas negociações…" />
              ) : c.negotiations.items.length === 0 ? (
                <EmptyState icon={<Raven variant="noite" />} title="Nenhuma negociação ainda">
                  Abra um anúncio na vitrine e mande uma proposta ao vendedor. Quando alguém negociar um jogo seu, a
                  conversa também aparece aqui.
                </EmptyState>
              ) : (
                <NegotiationList items={c.negotiations.items} onOpen={(key) => openChatInbox({ key })} />
              )}
            </section>
          ) : (
            <>
              {c.recent.error ? (
                <FeedError error={c.recent.error} onRetry={c.retry} />
              ) : c.recent.loading ? (
                <LoadingCard message="Abrindo a vitrine…" />
              ) : c.featured.length === 0 ? (
                <EmptyState icon={<Raven variant="noite" />} title="A Loja está vazia">
                  Ninguém anunciou jogos ainda. Anuncie os seus pela estante, em “Meus Jogos”.
                </EmptyState>
              ) : (
                <>
                  <FeaturedCarousel offers={c.featured} />

                  <section className="store-section" aria-labelledby="store-recent">
                    <div className="store-section__head">
                      <h2 id="store-recent">Anúncios recentes</h2>
                    </div>
                    <HScroller label="Anúncios recentes">
                      {c.recent.offers.map((offer) => (
                        <StoreCard key={offer.id} offer={offer} />
                      ))}
                    </HScroller>
                  </section>
                </>
              )}

              <CategoryTiles
                title="Explore por categoria"
                lead="Encontre o próximo clássico da sua estante."
                hrefFor={storeCategoryPath}
                counts={c.categoryCounts}
                countLabel={(n) => (n === 1 ? '1 anúncio' : `${n} anúncios`)}
              />

              <section className="store-section store-section--explore" id="explorar" aria-labelledby="store-explore">
                <div className="store-section__head">
                  <h2 id="store-explore">{c.sort === 'price-asc' ? 'Preços mais baixos' : 'Todos os anúncios'}</h2>
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
                  <button
                    type="button"
                    aria-pressed={c.budgetOnly}
                    className={cx('store-chip', 'store-chip--budget', c.budgetOnly && 'is-on')}
                    onClick={c.toggleBudget}
                  >
                    Até R$ {BUDGET_LIMIT}
                  </button>
                  <div className="store-filters__selects">
                    <MultiSelect
                      label="Categoria"
                      options={c.categoryNames}
                      counts={c.categoryCounts}
                      selected={c.selectedCategories}
                      onToggle={c.toggleCategory}
                      onClear={c.clearCategories}
                    />
                    <FilterSelect<StoreSort>
                      label="Ordenar"
                      ariaLabel="Ordenar anúncios por"
                      value={c.sort}
                      options={STORE_SORTS}
                      onChange={c.setSort}
                    />
                  </div>
                </div>

                <p className="visually-hidden" aria-live="polite">
                  {c.explore.loading ? 'Buscando anúncios' : `${c.explore.offers.length} anúncios`}
                </p>

                {c.explore.error ? (
                  <FeedError error={c.explore.error} onRetry={c.retry} />
                ) : c.explore.loading ? (
                  <div className="store-grid" aria-busy="true">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="store-page__skeleton" />
                    ))}
                  </div>
                ) : c.explore.offers.length === 0 ? (
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
                    {c.explore.offers.map((offer) => (
                      <StoreCard key={offer.id} offer={offer} emphasizePrice />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </Container>
      </main>
    </>
  )
}
