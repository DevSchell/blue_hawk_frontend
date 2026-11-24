/** Caixa de conversas (botão de chat da topbar): chats das partidas, negociações da Loja e conversas diretas */

export type ChatInboxKind = 'MATCH_TABLE' | 'MATCH_DIRECT' | 'NEGOTIATION' | 'DIRECT'

export type ChatInboxItem = {
  /** "match:{id}:table", "match:{id}:{outraPessoa}", "neg:{id}" ou "dm:{id}" */
  key: string
  kind: ChatInboxKind
  title: string
  subtitle: string
  matchId: string | null
  withUserId: string | null
  negotiationId: string | null
  /** Conversa direta (DIRECT) */
  directConversationId?: string | null
  status: 'OPEN' | 'CANCELLED' | 'ACCEPTED' | 'CLOSED' | 'PENDING' | 'REJECTED'
  unread: number
  lastActivityAt: string
  lastMessage: { body: string; createdAt: string; senderName: string; mine: boolean } | null
}

/** Pede para abrir a caixa de conversas (opcionalmente numa conversa); quem ouve é o botão de chat */
export const OPEN_CHAT_EVENT = 'bluehawk:open-chat'

export type OpenChatDetail = { key?: string; filter?: ChatInboxFilter }

export type ChatInboxFilter = 'todas' | 'mesas' | 'negociacoes' | 'diretas'

export function openChatInbox(detail: OpenChatDetail = {}) {
  window.dispatchEvent(new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail }))
}

/** Itens do filtro escolhido */
export function filterInbox(items: ChatInboxItem[], filter: ChatInboxFilter) {
  if (filter === 'mesas') return items.filter((i) => i.kind === 'MATCH_TABLE' || i.kind === 'MATCH_DIRECT')
  if (filter === 'diretas') return items.filter((i) => i.kind === 'DIRECT')
  if (filter === 'negociacoes') return items.filter((i) => i.kind === 'NEGOTIATION')
  return items
}

/** Chave da conversa de uma negociação */
export const negotiationKey = (negotiationId: string) => `neg:${negotiationId}`
