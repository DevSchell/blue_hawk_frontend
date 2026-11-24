import type { ChatInboxItem } from '../chatInbox'
import type { Negotiation, NegotiationMessage } from '../negotiation'
import { apiGet, apiPost } from './apiClient'

const base = (id: string) => `/negotiations/${encodeURIComponent(id)}`

/** Começa (ou continua) a negociação do comprador com uma mensagem e, se quiser, uma proposta */
export function startNegotiation(offerId: string, body: string, proposedPrice: number | null) {
  return apiPost<Negotiation>(`/offers/${encodeURIComponent(offerId)}/negotiations`, { body, proposedPrice })
}

export function getNegotiation(id: string, signal?: AbortSignal) {
  return apiGet<Negotiation>(base(id), {}, signal)
}

export function listNegotiationMessages(id: string, after?: string, signal?: AbortSignal) {
  return apiGet<NegotiationMessage[]>(`${base(id)}/messages`, { after }, signal)
}

export function sendNegotiationMessage(id: string, body: string, proposedPrice: number | null) {
  return apiPost<NegotiationMessage>(`${base(id)}/messages`, { body, proposedPrice })
}

/** Só o vendedor: aceita a proposta da mensagem; o anúncio sai da Loja como vendido */
export function acceptProposal(id: string, messageId: string) {
  return apiPost<Negotiation>(`${base(id)}/accept`, { messageId })
}

/** Caixa de conversas: chats das partidas e negociações, da atividade mais recente para a mais antiga */
export function listInbox(signal?: AbortSignal) {
  return apiGet<ChatInboxItem[]>('/chats', {}, signal)
}

/** Notificações de mensagem não lidas (partidas e negociações) */
export function getInboxUnreadCount(signal?: AbortSignal) {
  return apiGet<{ count: number }>('/chats/unread-count', {}, signal)
}
