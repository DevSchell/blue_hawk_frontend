import type { StoreOffer, StoreSort } from '../store'
import { apiGet } from './apiClient'

/** Vitrine pública da Loja. {@code q}: nome do jogo; {@code category}: nome da categoria. */
export function listStoreOffers(
  params: { sort: StoreSort; q?: string; category?: string; limit?: number },
  signal?: AbortSignal,
) {
  return apiGet<StoreOffer[]>('/store/offers', params, signal)
}
