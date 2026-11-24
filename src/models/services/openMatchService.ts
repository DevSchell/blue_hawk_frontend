import type { HostMatchInput, JoinRequest, OpenMatch } from '../openMatch'
import { apiDeleteJson, apiGet, apiPost } from './apiClient'

/** Partidas abertas (público). {@code mine}: as que o usuário hospeda ou pediu para entrar. */
export function listOpenMatches(params: { city?: string; boardgameId?: string; mine?: boolean }, signal?: AbortSignal) {
  return apiGet<OpenMatch[]>(
    '/open-matches',
    { city: params.city, boardgameId: params.boardgameId, mine: params.mine ? 'true' : undefined },
    signal,
  )
}

export function hostMatch(input: HostMatchInput) {
  return apiPost<OpenMatch>('/open-matches', input)
}

/** O host cancela */
/** O host cancela a partida; o motivo vai na notificação de quem pediu vaga */
export function cancelMatch(id: string, reason: string) {
  return apiDeleteJson<OpenMatch>(`/open-matches/${encodeURIComponent(id)}`, undefined, { reason })
}

/** Pedido de entrada com mensagem para o host */
export function requestToJoin(id: string, message: string) {
  return apiPost<OpenMatch>(`/open-matches/${encodeURIComponent(id)}/requests`, { message })
}

export function cancelMyRequest(id: string) {
  return apiDeleteJson<OpenMatch>(`/open-matches/${encodeURIComponent(id)}/requests/mine`)
}

/**
 * Partidas do Jogue já realizadas pelo usuário (host ou aceito), por jogo.
 * É a única fonte das "partidas jogadas" da estante.
 */
export function listPlayedByMe(signal?: AbortSignal) {
  return apiGet<{ boardgameId: string; plays: number }[]>('/open-matches/stats/played', {}, signal)
}

/** Só o host */
export function listJoinRequests(id: string, signal?: AbortSignal) {
  return apiGet<JoinRequest[]>(`/open-matches/${encodeURIComponent(id)}/requests`, {}, signal)
}

export function acceptJoinRequest(requestId: string, reply: string) {
  return apiPost<JoinRequest>(`/open-match-requests/${encodeURIComponent(requestId)}/accept`, { reply: reply || null })
}

export function rejectJoinRequest(requestId: string, reply: string) {
  return apiPost<JoinRequest>(`/open-match-requests/${encodeURIComponent(requestId)}/reject`, { reply: reply || null })
}

/** Uma partida (ex.: aberta por uma notificação) */
export function getOpenMatch(id: string, signal?: AbortSignal) {
  return apiGet<OpenMatch>(`/open-matches/${encodeURIComponent(id)}`, {}, signal)
}
