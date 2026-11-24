/** Chat da partida (Jogue): a "mesa" (host + aceitos) e as conversas diretas host ↔ participante */

export const CHAT_MESSAGE_MAX = 1000

export type ChatMessage = {
  id: string
  senderId: string
  senderName: string
  /** null = mensagem para a mesa */
  recipientId: string | null
  body: string
  /** ISO-8601 UTC */
  createdAt: string
  mine: boolean
}

export type ChatMember = { userId: string; name: string; isHost: boolean }

export type ChatThread = {
  /** A outra pessoa da conversa */
  userId: string
  name: string
  /** Situação do pedido dessa pessoa; "HOST" quando a conversa é com o host */
  requestStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'HOST'
  unread: number
  lastMessage: { body: string; createdAt: string; senderId: string } | null
}

export type ChatOverview = {
  canUseTableChat: boolean
  tableUnread: number
  members: ChatMember[]
  threads: ChatThread[]
}

/** Conversa aberta: a mesa (null) ou o id da outra pessoa */
export type ChatTarget = string | null
