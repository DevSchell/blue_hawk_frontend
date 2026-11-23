import { useState } from 'react'
import { useStoreController } from '../../../controllers/useStoreController'
import type { StoreOffer } from '../../../models/services/shelfService'
import { Raven } from '../../components/Brand/Raven'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { SearchField } from '../../components/SearchField/SearchField'
import { BoardgameModal } from '../../features/boardgames/BoardgameModal'
import { GameCover } from '../../features/boardgames/GameCover'
import { brl } from '../../features/boardgames/format'
import '../FeedPage/FeedPage.css'
import '../ShelfPage/ShelfPage.css'

/** Loja: ofertas à venda de todos os usuários */
export function StorePage({ onSignIn, signedIn }: { onSignIn: () => void; signedIn: boolean }) {
  const store = useStoreController()
  const [open, setOpen] = useState<StoreOffer | null>(null)

  return (
    <main className="feed-page">
      <Container>
        <h1 className="feed-page__title">Loja</h1>
        {!signedIn ? (
          <EmptyState icon={<Raven variant="noite" />} title="Entre para ver as ofertas">
            As ofertas dos outros jogadores aparecem para quem está logado.
            <div className="shelf-empty__action">
              <Button onClick={onSignIn}>Entrar</Button>
            </div>
          </EmptyState>
        ) : (
          <>
            <div className="shelf-toolbar">
              <SearchField id="busca-loja" label="Buscar oferta pelo nome do jogo" placeholder="Ex.: Catan" value={store.search} onChange={store.setSearch} />
            </div>
            {store.error ? (
              <Alert title="Não deu para carregar" tone="warn" action={<Button variant="link" onClick={store.retry}>Tentar de novo</Button>}>
                Verifique a conexão e tente outra vez.
              </Alert>
            ) : store.loading ? (
              <p className="shelf-status" aria-busy="true">Carregando ofertas…</p>
            ) : store.offers.length === 0 ? (
              <EmptyState icon={<Raven variant="noite" />} title={store.query ? 'Nenhuma oferta com esse nome' : 'Nenhuma oferta no momento'}>
                {store.query ? 'Tente outra palavra ou limpe a busca.' : 'Quando alguém colocar um jogo à venda, ele aparece aqui.'}
              </EmptyState>
            ) : (
              <ul className="shelf-grid">
                {store.offers.map((offer) => (
                  <li key={offer.id} className="shelf-card">
                    <GameCover id={offer.game.id} name={offer.game.name} />
                    <div className="shelf-card__body">
                      <h3 className="shelf-card__title">
                        <button type="button" className="shelf-card__link" onClick={() => setOpen(offer)}>{offer.game.name}</button>
                      </h3>
                      <b className="shelf-card__price">{brl.format(offer.price)}</b>
                      {offer.description && <p className="shelf-card__text">{offer.description}</p>}
                      <span className="shelf-card__meta">
                        {offer.sellerId === store.userId ? 'Oferta sua' : `Vendedor: ${offer.sellerName}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Container>
      {open && <BoardgameModal key={open.id} game={open.game} onClose={() => setOpen(null)} />}
    </main>
  )
}
