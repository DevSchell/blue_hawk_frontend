import type { Match, MatchParticipant, Offer, UserBoardgame } from '../market'
import { apiDelete, apiGet, apiPatch } from './apiClient'
import { deleteMatch, removeParticipant } from './matchesService'
import { clearUserCache, deleteCopy, deleteOffer, fetchAll } from './shelfService'

/** UserOutput da API */
export type User = { id: string; name: string; email: string; role: string }

export const getUser = (id: string, signal?: AbortSignal) => apiGet<User>(`/users/${id}`, {}, signal)

/** PATCH /users/{id}: só os campos enviados mudam */
export async function updateUser(id: string, patch: { name?: string; email?: string }) {
  const saved = await apiPatch<User>(`/users/${id}`, patch)
  clearUserCache()
  return saved
}

/** PATCH /users/{id}/password. O token antigo deixa de valer; o novo vem na resposta. */
export function changePassword(id: string, currentPassword: string, newPassword: string) {
  return apiPatch<unknown>(`/users/${id}/password`, { currentPassword, newPassword })
}

/**
 * Tira uma cópia da estante. A API recusa apagar cópia que tenha oferta ou partida (erro 500),
 * então apaga antes as ofertas (de qualquer status) e as partidas dela.
 */
export async function purgeCopy(userId: string, copyId: string) {
  const offers = await fetchAll<Offer>('/offers', { userId })
  for (const offer of offers.filter((o) => o.userBoardgameId === copyId)) await deleteOffer(offer.id)
  const matches = await fetchAll<Match>('/matches', { userBoardgameId: copyId })
  for (const match of matches) await deleteMatch(match.id)
  await deleteCopy(copyId)
}

/** Exclui a conta e tudo o que depende dela (a API não faz em cascata) */
export async function deleteAccount(userId: string) {
  const copies = await fetchAll<UserBoardgame>('/user-boardgames', { userId })
  for (const copy of copies) await purgeCopy(userId, copy.id)
  const participations = await fetchAll<MatchParticipant>('/match-participants', { userId })
  for (const participation of participations) await removeParticipant(participation.id)
  await apiDelete(`/users/${userId}`)
}
