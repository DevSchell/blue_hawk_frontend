import { readToken, updateToken } from '../session'
import type { Match, MatchParticipant, Offer, UserBoardgame } from '../shelf'
import { ApiError, apiGet, apiPost } from './apiClient'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function shelfDelete(path: string, signal?: AbortSignal): Promise<void> {
  const token = readToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  })

  if (!response.ok) {
    throw new ApiError(response.status, `DELETE ${path} falhou com ${response.status}`)
  }

  const headerToken = response.headers.get('accessToken') ?? response.headers.get('X-New-Token')
  if (headerToken) updateToken(headerToken)

  const text = await response.text()
  if (text) {
    try {
      const body: unknown = JSON.parse(text)
      if (body !== null && typeof body === 'object' && 'accessToken' in body && typeof body.accessToken === 'string') {
        updateToken(body.accessToken)
      }
    } catch {
      return
    }
  }
}

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

export function registerMatch(userBoardgameId: string) {
  return apiPost<Match>('/matches', { userBoardgameId })
}

export async function deleteMatch(matchId: string, signal?: AbortSignal) {
  const participants = await apiGet<MatchParticipant[]>(
    '/match-participants',
    { matchId, page: 0, size: 100 },
    signal,
  ).catch(() => [])
  for (const participant of participants) {
    await shelfDelete(`/match-participants/${encodeURIComponent(participant.id)}`, signal)
  }
  await shelfDelete(`/matches/${encodeURIComponent(matchId)}`, signal)
}

export function listUserOffers(userId: string, signal?: AbortSignal) {
  return apiGet<Offer[]>('/offers', { userId, page: 0, size: 100 }, signal)
}

export function createShelfOffer(userBoardgameId: string, price: number, description?: string) {
  return apiPost<Offer>('/offers', {
    userBoardgameId,
    price,
    status: 'ACTIVE',
    description: description || null,
  })
}

export function deleteShelfOffer(offerId: string, signal?: AbortSignal) {
  return shelfDelete(`/offers/${encodeURIComponent(offerId)}`, signal)
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
    await shelfDelete(`/user-boardgames/${encodeURIComponent(copyId)}`)
  }
}
