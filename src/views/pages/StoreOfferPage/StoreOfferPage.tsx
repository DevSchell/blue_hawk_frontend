import { useEffect, useState } from 'react'
import { conditionLabel, deliveryLabel } from '../../../models/offerDetails'
import { openChatInbox } from '../../../models/chatInbox'
import { ApiError, apiUrl } from '../../../models/services/apiClient'
import { getStoreOffer, listStoreOffers } from '../../../models/services/storeService'
import type { StoreOffer } from '../../../models/store'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { UserLink } from '../../components/UserLink/UserLink'
import { formatPlayers } from '../../features/boardgames/format'
import { GameCover } from '../../features/boardgames/GameCover'
import { ContactSeller } from '../../features/store/ContactSeller'
import { formatPrice, formatSince } from '../../features/store/format'
import { StoreCover } from '../../features/store/StoreCard'
import { ACCOUNT_ROUTES, gamePath, storeCategoryPath, storeOfferPath } from '../../layout/navigation'
import { BackButton } from '../../components/BackButton/BackButton'
import '../../features/boardgames/CategoryTag.css'
import { requestLogin } from '../../../models/loginPrompt'
import { readUserId } from '../../../models/session'
import '../ProductPage.css'

type Loaded = { offer: StoreOffer; related: StoreOffer[] }

/**
 * Página do anúncio (estilo página de produto da Steam): capa grande, quadro de informações,
 * a faixa de compra com o contato e, embaixo, o exemplar, o jogo e outras ofertas.
 */
export function StoreOfferPage({ offerId }: { offerId: string }) {
  const [state, setState] = useState<{ data: Loaded | null; error: unknown }>({ data: null, error: null })

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getStoreOffer(offerId, controller.signal),
      // Para "mais ofertas deste jogo" e "mais de quem vende"
      listStoreOffers({ sort: 'recent', limit: 100 }, controller.signal).catch(() => [] as StoreOffer[]),
    ])
      .then(([offer, related]) => setState({ data: { offer, related }, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, error })
      })
    return () => controller.abort()
  }, [offerId])

  if (state.error) {
    const gone = state.error instanceof ApiError && state.error.status === 404
    return (
      <main className="product-page">
        <Container>
          <EmptyState
            icon={<Raven variant="noite" />}
            title={gone ? 'Anúncio indisponível' : 'Não deu para abrir o anúncio'}
            action={
              <div className="product-page__state">
                <a className="button button--primary" href="/loja">
                  Voltar à Loja
                </a>
              </div>
            }
          >
            {gone
              ? 'Este jogo já foi vendido ou o anúncio saiu da Loja.'
              : 'Verifique a conexão e tente de novo.'}
          </EmptyState>
        </Container>
      </main>
    )
  }

  if (!state.data) {
    return (
      <main className="product-page">
        <Container>
          <LoadingCard message="Abrindo o anúncio…" />
        </Container>
      </main>
    )
  }

  return <OfferContent {...state.data} />
}

function OfferContent({ offer, related }: Loaded) {
  const { game } = offer
  const sameGame = related.filter((o) => o.game.id === game.id && o.id !== offer.id)
  const sameSeller = related.filter((o) => o.sellerId === offer.sellerId && o.id !== offer.id).slice(0, 5)

  return (
    <main className="product-page">
      <Container>
        <BackButton fallback="/loja" />
        <ol className="product-page__crumbs" aria-label="Você está em">
          <li>
            <a href="/loja">Loja</a>
          </li>
          {game.category && (
            <li>
              <a href={storeCategoryPath(game.category)}>{game.category}</a>
            </li>
          )}
          <li aria-current="page">{game.name}</li>
        </ol>

        <div className="product-page__title-row">
          <h1 className="product-page__title">{game.name}</h1>
        </div>

        <div className="product-page__top">
          <div className="product-page__media">
            <StoreCover offer={offer} />
          </div>

          <aside className="product-page__info" aria-label="Resumo do anúncio">
            {(offer.description || game.description) && (
              <p className="product-page__summary">{offer.description || game.description}</p>
            )}
            <dl className="product-page__details">
              <dt>Vendido por</dt>
              <dd>
                {offer.isMine ? 'Você' : <UserLink userId={offer.sellerId}>{offer.sellerName}</UserLink>}
              </dd>
              <dt>Estado</dt>
              <dd>{conditionLabel(offer.condition) ?? 'Não informado'}</dd>
              <dt>Entrega</dt>
              <dd>{deliveryLabel(offer.deliveryMethod, offer.isMine ? 'seller' : 'buyer')}</dd>
              {offer.createdAt && (
                <>
                  <dt>Anunciado</dt>
                  <dd>{formatSince(offer.createdAt)}</dd>
                </>
              )}
              {game.releaseYear && (
                <>
                  <dt>Lançamento</dt>
                  <dd>{game.releaseYear}</dd>
                </>
              )}
              {game.playerNumber && (
                <>
                  <dt>Jogadores</dt>
                  <dd>{formatPlayers(game.playerNumber)}</dd>
                </>
              )}
              {game.playTime && (
                <>
                  <dt>Duração</dt>
                  <dd>{game.playTime} min</dd>
                </>
              )}
            </dl>
            <div className="product-page__tags">
              {game.category && <span className="badge category-tag">{game.category}</span>}
              <span className="badge product-page__condition">{conditionLabel(offer.condition) ?? 'Usado'}</span>
            </div>
          </aside>
        </div>

        <section className="product-page__action" aria-labelledby="comprar">
          <div>
            <h2 id="comprar">Comprar {game.name}</h2>
            <p className="product-page__action-sub">
              {conditionLabel(offer.condition) ? `Exemplar ${conditionLabel(offer.condition)!.toLowerCase()}` : 'Exemplar usado'}
              {' · entrega: '}
              {deliveryLabel(offer.deliveryMethod, offer.isMine ? 'seller' : 'buyer').toLowerCase()}
            </p>
          </div>
          <div className="product-page__buy">
            <span className="product-page__price">{formatPrice(offer.price)}</span>
            {offer.isMine ? (
              <Button type="button" variant="secondary" onClick={() => openChatInbox({ filter: 'negociacoes' })}>
                Ver negociações
              </Button>
            ) : !readUserId() ? (
              // Visitante: entrar em contato pede login primeiro
              <Button type="button" onClick={requestLogin}>
                Entrar em contato
              </Button>
            ) : (
              <a className="button button--primary" href="#falar-com-quem-vende">
                Entrar em contato
              </a>
            )}
          </div>
        </section>

        <div className="product-page__columns">
          <div className="product-page__main">
            {offer.isMine ? (
              <section className="product-page__section">
                <h2>Este anúncio é seu</h2>
                <p>As mensagens de quem se interessar chegam nas suas conversas. Para remover, use a sua estante.</p>
                <a className="product-page__link" href={ACCOUNT_ROUTES.shelf}>
                  Ir para Meus Jogos
                </a>
              </section>
            ) : (
              <ContactSeller offer={offer} />
            )}

            {offer.description && (
              <section className="product-page__section" aria-labelledby="sobre-exemplar">
                <h2 id="sobre-exemplar">Sobre este exemplar</h2>
                <p>{offer.description}</p>
              </section>
            )}

            <section className="product-page__section" aria-labelledby="sobre-jogo">
              <h2 id="sobre-jogo">Sobre o jogo</h2>
              <p>{game.description || 'Este jogo ainda não tem descrição.'}</p>
              <a className="product-page__link" href={gamePath(game.id)}>
                Ver {game.name} na Wiki
              </a>
            </section>
          </div>

          <aside className="product-page__aside">
            <OfferList
              title={sameGame.length > 0 ? `Mais ofertas de ${game.name}` : 'Outras ofertas'}
              offers={sameGame}
              empty="Este é o único anúncio deste jogo agora."
            />
            {!offer.isMine && (
              <OfferList
                title={`Mais de ${offer.sellerName}`}
                offers={sameSeller}
                empty={`${offer.sellerName} não tem outros anúncios agora.`}
              />
            )}
          </aside>
        </div>
      </Container>
    </main>
  )
}

function OfferList({ title, offers, empty }: { title: string; offers: StoreOffer[]; empty: string }) {
  return (
    <section className="product-page__section">
      <h3>{title}</h3>
      {offers.length === 0 ? (
        <p>{empty}</p>
      ) : (
        <ul className="product-page__list">
          {offers.map((o) => (
            <li key={o.id}>
              <a href={storeOfferPath(o.id)}>
                <span className="product-page__thumb">
                  <GameCover
                    id={o.game.id}
                    name={o.game.name}
                    preset={o.game.coverPreset}
                    imageUrl={o.game.coverImageUrl ? apiUrl(o.game.coverImageUrl) : null}
                  />
                </span>
                <span>
                  <b>{o.game.name}</b>
                  <br />
                  <span>por {o.isMine ? 'você' : o.sellerName}</span>
                </span>
                <span className="product-page__list-price">{formatPrice(o.price)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
