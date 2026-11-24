import type { Boardgame } from '../boardgame'
import type { Match, MatchParticipant, Offer, UserBoardgame } from '../market'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

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

/* ---- Estante (página /estante): cópias, partidas e ofertas do usuário ---- */

export function listUserBoardgames(userId: string, signal?: AbortSignal) {
  return apiGet<UserBoardgame[]>('/user-boardgames', { userId, page: 0, size: 100 }, signal)
}

export async function addToShelf(userId: string, boardgameId: string) {
  const existing = await apiGet<UserBoardgame[]>('/user-boardgames', {
    userId,
    boardgameId,
    page: 0,
    size: 1,
  })
  if (existing.length > 0) {
    return existing[0]
  }
  return apiPost<UserBoardgame>('/user-boardgames', { userId, boardgameId })
}

export function listMatchesByUserBoardgame(userBoardgameId: string, signal?: AbortSignal) {
  return apiGet<Match[]>('/matches', { userBoardgameId, page: 0, size: 100 }, signal)
}

export async function deleteMatch(matchId: string, signal?: AbortSignal) {
  const participants = await apiGet<MatchParticipant[]>(
    '/match-participants',
    { matchId, page: 0, size: 100 },
    signal,
  ).catch(() => [])
  for (const participant of participants) {
    await apiDelete(`/match-participants/${encodeURIComponent(participant.id)}`, signal)
  }
  await apiDelete(`/matches/${encodeURIComponent(matchId)}`, signal)
}

export function listUserOffers(userId: string, signal?: AbortSignal) {
  return apiGet<Offer[]>('/offers', { userId, page: 0, size: 100 }, signal)
}

export function deleteShelfOffer(offerId: string, signal?: AbortSignal) {
  return apiDelete(`/offers/${encodeURIComponent(offerId)}`, signal)
}

export async function removeFromShelf(userBoardgameIds: string | string[], userId?: string | null) {
  const ids = Array.isArray(userBoardgameIds) ? userBoardgameIds : [userBoardgameIds]
  const idSet = new Set(ids)

  if (userId) {
    const offers = await listUserOffers(userId).catch(() => [])
    const linkedOffers = offers.filter((o) => idSet.has(o.userBoardgameId))
    for (const offer of linkedOffers) {
      await deleteShelfOffer(offer.id)
    }
  }

  for (const copyId of ids) {
    const matches = await listMatchesByUserBoardgame(copyId).catch(() => [])
    for (const match of matches) {
      await deleteMatch(match.id)
    }
    await apiDelete(`/user-boardgames/${encodeURIComponent(copyId)}`)
  }
}
