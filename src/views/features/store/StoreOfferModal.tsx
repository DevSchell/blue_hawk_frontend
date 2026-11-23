import type { StoreOffer } from '../../../models/store'
import { Alert } from '../../components/Alert/Alert'
import { Modal } from '../../components/Modal/Modal'
import { formatPlayers } from '../boardgames/format'
import { formatPrice, formatSince } from './format'
import { StoreCover } from './StoreCard'
import './StoreOfferModal.css'

type StoreOfferModalProps = {
  offer: StoreOffer
  onClose: () => void
}

/** Detalhes de um anúncio da Loja */
export function StoreOfferModal({ offer, onClose }: StoreOfferModalProps) {
  const { game } = offer
  const facts = [
    game.category,
    game.playerNumber ? formatPlayers(game.playerNumber) : null,
    game.playTime ? `${game.playTime} min` : null,
    game.releaseYear ? `Lançado em ${game.releaseYear}` : null,
  ].filter(Boolean)

  return (
    <Modal open onClose={onClose} title={game.name} size="lg" media={<StoreCover offer={offer} />}>
      <div className="store-offer">
        <div className="store-offer__buy">
          <span className="store-offer__price">{formatPrice(offer.price)}</span>
          <span className="store-offer__seller">
            Vendido por <b>{offer.isMine ? 'você' : offer.sellerName}</b>
            {offer.createdAt && <> • anunciado {formatSince(offer.createdAt)}</>}
          </span>
        </div>

        {facts.length > 0 && (
          <ul className="store-offer__facts">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        )}

        {offer.description && (
          <section className="store-offer__section" aria-labelledby="store-offer-seller-note">
            <h3 id="store-offer-seller-note">Sobre este exemplar</h3>
            <p>{offer.description}</p>
          </section>
        )}

        {game.description && (
          <section className="store-offer__section" aria-labelledby="store-offer-game">
            <h3 id="store-offer-game">Sobre o jogo</h3>
            <p>{game.description}</p>
          </section>
        )}

        {/* A API ainda não tem negociação entre comprador e vendedor */}
        <Alert size="sm" title={offer.isMine ? 'Este anúncio é seu' : 'Negociação em breve'}>
          {offer.isMine
            ? 'Você pode removê-lo pela sua estante, em “Meus Jogos”.'
            : 'Em breve você poderá enviar uma proposta direto ao vendedor por aqui.'}
        </Alert>
      </div>
    </Modal>
  )
}
