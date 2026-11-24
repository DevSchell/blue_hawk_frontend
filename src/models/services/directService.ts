import type { DirectConversation } from '../directConversation'
import type { ChatMessage } from '../matchChat'
import { apiGet, apiPost } from './apiClient'

const base = (id: string) => `/direct-conversations/${encodeURIComponent(id)}`

/** Abre (ou reaproveita) a conversa com a pessoa. 403: ela não aceita mensagens diretas */
export function startDirectConversation(userId: string) {
  return apiPost<DirectConversation>('/direct-conversations', { userId })
}

export function getDirectConversation(id: string, signal?: AbortSignal) {
  return apiGet<DirectConversation>(base(id), {}, signal)
}

/** Mensagens da conversa; {@code after}: só as novas. Ler marca as notificações dela como lidas */
export function listDirectMessages(id: string, after?: string, signal?: AbortSignal) {
  return apiGet<ChatMessage[]>(`${base(id)}/messages`, { after }, signal)
}

export function sendDirectMessage(id: string, body: string) {
  return apiPost<ChatMessage>(`${base(id)}/messages`, { body })
}
