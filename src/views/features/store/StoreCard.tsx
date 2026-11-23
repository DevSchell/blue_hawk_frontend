import type { StoreOffer } from '../../../models/store'
import { apiUrl } from '../../../models/services/apiClient'
import { cx } from '../../utils/classNames'
import { GameCover } from '../boardgames/GameCover'
import { formatPrice } from './format'
import './StoreCard.css'

/** Capa do jogo de um anúncio (foto enviada ou arte do site) */
export function StoreCover({ offer }: { offer: StoreOffer }) {
  const { game } = offer
  return (
    <GameCover
      id={game.id}
      name={game.name}
      preset={game.coverPreset}
      imageUrl={game.coverImageUrl ? apiUrl(game.coverImageUrl) : null}
    />
  )
}

type StoreCardProps = {
  offer: StoreOffer
  onOpen: (offer: StoreOffer) => void
  /** Destaca o preço (seção "Preços mais baixos") */
  emphasizePrice?: boolean
}

/** Card de anúncio: capa com zoom e descrição que sobe no hover, como numa vitrine de jogos */
export function StoreCard({ offer, onOpen, emphasizePrice = false }: StoreCardProps) {
  const { game } = offer
  return (
    <article className={cx('store-card', emphasizePrice && 'store-card--price')}>
      <div className="store-card__media">
        <StoreCover offer={offer} />
        {offer.isMine && <span className="store-card__mine">Seu anúncio</span>}
        <p className="store-card__peek" aria-hidden="true">
          {offer.description || game.description || 'Sem descrição.'}
        </p>
      </div>
      <div className="store-card__body">
        <h3 className="store-card__title">
          <button type="button" className="store-card__open" onClick={() => onOpen(offer)}>
            {game.name}
          </button>
        </h3>
        <div className="store-card__meta">
          {game.category && <span className="store-card__category">{game.category}</span>}
          <span className="store-card__seller">por {offer.isMine ? 'você' : offer.sellerName}</span>
        </div>
        <span className="store-card__price">{formatPrice(offer.price)}</span>
      </div>
    </article>
  )
}
