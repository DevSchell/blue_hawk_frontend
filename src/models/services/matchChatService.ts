import type { ChatMessage, ChatOverview, ChatTarget } from '../matchChat'
import { apiGet, apiPost } from './apiClient'

const base = (matchId: string) => `/open-matches/${encodeURIComponent(matchId)}`

/** Mesa, membros e conversas diretas que quem está vendo pode abrir */
export function getChatOverview(matchId: string, signal?: AbortSignal) {
  return apiGet<ChatOverview>(`${base(matchId)}/chats`, {}, signal)
}

/** Mensagens da mesa (target null) ou da conversa com {@code target}; {@code after}: só as novas */
export function listMessages(matchId: string, target: ChatTarget, after?: string, signal?: AbortSignal) {
  return apiGet<ChatMessage[]>(`${base(matchId)}/messages`, { with: target ?? undefined, after }, signal)
}

export function sendMessage(matchId: string, target: ChatTarget, body: string) {
  return apiPost<ChatMessage>(`${base(matchId)}/messages`, { body, recipientId: target })
}
