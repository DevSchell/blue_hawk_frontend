import type { StoreOffer } from '../../../models/store'
import { conditionLabel, deliveryLabel } from '../../../models/offerDetails'
import { apiUrl } from '../../../models/services/apiClient'
import { TruckIcon } from '../../components/Icons/Icons'
import { cx } from '../../utils/classNames'
import { GameCover } from '../boardgames/GameCover'
import { formatPrice } from './format'
import './StoreCard.css'
import { storeOfferPath } from '../../layout/navigation'

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
  /** Destaca o preço (seção "Preços mais baixos") */
  emphasizePrice?: boolean
}

/** Card de anúncio: capa com zoom e descrição que sobe no hover, como numa vitrine de jogos */
export function StoreCard({ offer, emphasizePrice = false }: StoreCardProps) {
  const { game } = offer
  return (
    <article className={cx('store-card', emphasizePrice && 'store-card--price')}>
      <div className="store-card__media">
        <StoreCover offer={offer} />
        {offer.isMine && <span className="badge store-card__mine">Seu anúncio</span>}
        {conditionLabel(offer.condition) && (
          <span className="badge store-card__condition">{conditionLabel(offer.condition)}</span>
        )}
        <p className="store-card__peek" aria-hidden="true">
          {offer.description || game.description || 'Sem descrição.'}
        </p>
      </div>
      <div className="store-card__body">
        <h3 className="store-card__title">
          {/* Abre a página do anúncio (estilo página de produto) */}
          <a className="store-card__open" href={storeOfferPath(offer.id)}>
            {game.name}
          </a>
        </h3>
        <div className="store-card__meta">
          {game.category && <span className="badge badge--outline store-card__category">{game.category}</span>}
          <span className="store-card__seller">por {offer.isMine ? 'você' : offer.sellerName}</span>
        </div>
        <span className="store-card__delivery">
          <TruckIcon />
          {deliveryLabel(offer.deliveryMethod, offer.isMine ? 'seller' : 'buyer')}
        </span>
        <span className="store-card__price">{formatPrice(offer.price)}</span>
      </div>
    </article>
  )
}
