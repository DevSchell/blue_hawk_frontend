/** Conversa direta entre dois usuários (fora de partida e de anúncio), iniciada pelo perfil público */

export type DirectConversation = {
  id: string
  otherUser: { id: string; name: string }
  /** false: a outra pessoa não aceita mensagens diretas (o histórico continua legível) */
  canSend: boolean
  lastMessage: { body: string; senderId: string; createdAt: string } | null
  unread: number
  createdAt: string
  lastMessageAt: string | null
}

/** Chave da conversa direta na caixa de conversas */
export const directKey = (conversationId: string) => `dm:${conversationId}`
