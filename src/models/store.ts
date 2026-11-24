import type { DeliveryMethod, OfferCondition } from './offerDetails'

/** Anúncio da vitrine da Loja (GET /store/offers): já traz o jogo e o vendedor */
export type StoreOffer = {
  id: string
  price: number
  description: string | null
  /** Estado de conservação (null em anúncios antigos) */
  condition: OfferCondition | null
  /** Forma de entrega (null em anúncios antigos) */
  deliveryMethod: DeliveryMethod | null
  createdAt: string | null
  sellerName: string
  /** Para abrir o perfil de quem vende */
  sellerId: string
  isMine: boolean
  game: {
    id: string
    name: string
    description: string | null
    category: string | null
    coverPreset: string | null
    /** Caminho relativo à API */
    coverImageUrl: string | null
    playerNumber: number | null
    playTime: number | null
    releaseYear: number | null
  }
}

export type StoreSort = 'recent' | 'price'

/** Página do anúncio na Loja (ex.: a partir das ofertas da Wiki e do perfil público) */
export const storeOfferHref = (offerId: string) => `/loja/anuncio/${encodeURIComponent(offerId)}`
