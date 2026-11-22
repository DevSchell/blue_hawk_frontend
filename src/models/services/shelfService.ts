import type { Boardgame } from '../boardgame'
import type { Offer, UserBoardgame } from '../market'
import { apiDelete, apiGet, apiPatch } from './apiClient'

const PAGE = 50

/** A API pagina tudo (padrão 10): junta as páginas até vir uma incompleta */
export async function fetchAll<T>(path: string, query: Record<string, string | undefined>, signal?: AbortSignal) {
  const all: T[] = []
  for (let page = 0; page < 10; page++) {
    const items = await apiGet<T[]>(path, { ...query, page, size: PAGE }, signal)
    all.push(...items)
    if (items.length < PAGE) break
  }
  return all
}

function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>) {
  let hit = cache.get(key)
  if (!hit) {
    hit = load().catch((error: unknown) => {
      cache.delete(key)
      throw error
    })
    cache.set(key, hit)
  }
  return hit
}

const games = new Map<string, Promise<Boardgame>>()
const copies = new Map<string, Promise<UserBoardgame>>()
const users = new Map<string, Promise<string>>()

export const clearUserCache = () => users.clear()
export const forgetGame = (id: string) => games.delete(id)

export const getGame = (id: string) => cached(games, id, () => apiGet<Boardgame>(`/boardgames/${id}`))
export const getCopy = (id: string) => cached(copies, id, () => apiGet<UserBoardgame>(`/user-boardgames/${id}`))
export const getUserName = (id: string) =>
  cached(users, id, async () => (await apiGet<{ name: string }>(`/users/${id}`)).name)

export type StoreOffer = Offer & { game: Boardgame; sellerId: string; sellerName: string }

/** Todas as ofertas ativas, já com o jogo e o vendedor de cada uma */
export async function listStoreOffers(signal?: AbortSignal): Promise<StoreOffer[]> {
  const offers = await fetchAll<Offer>('/offers', { status: 'ACTIVE' }, signal)
  const rows = await Promise.all(
    offers.map(async (offer) => {
      try {
        const copy = await getCopy(offer.userBoardgameId)
        const [game, sellerName] = await Promise.all([
          getGame(copy.boardgameId),
          getUserName(copy.userId).catch(() => 'Vendedor'),
        ])
        return { ...offer, game, sellerId: copy.userId, sellerName }
      } catch {
        return null
      }
    }),
  )
  return rows.filter((row): row is StoreOffer => row !== null)
}

export type ShelfItem = { copy: UserBoardgame; game: Boardgame; offer: Offer | null }

/** Jogos da estante do usuário, cada um com a oferta ativa (se houver) */
export async function listShelf(userId: string, signal?: AbortSignal): Promise<ShelfItem[]> {
  const [mine, offers] = await Promise.all([
    fetchAll<UserBoardgame>('/user-boardgames', { userId }, signal),
    fetchAll<Offer>('/offers', { userId, status: 'ACTIVE' }, signal),
  ])
  const rows = await Promise.all(
    mine.map(async (copy) => {
      try {
        const game = await getGame(copy.boardgameId)
        return { copy, game, offer: offers.find((o) => o.userBoardgameId === copy.id) ?? null }
      } catch {
        return null
      }
    }),
  )
  return rows.filter((row): row is ShelfItem => row !== null)
}

export function updateOffer(id: string, price: number, description: string) {
  return apiPatch<Offer>(`/offers/${id}`, { price, description: description || null })
}

export const deleteOffer = (id: string) => apiDelete(`/offers/${id}`)
export const deleteCopy = (id: string) => apiDelete(`/user-boardgames/${id}`)
