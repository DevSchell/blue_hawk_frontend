/** Notificações do usuário (sininho da topbar) */

export type NotificationType =
  | 'JOIN_REQUEST_RECEIVED'
  | 'JOIN_REQUEST_WITHDRAWN'
  | 'JOIN_REQUEST_ACCEPTED'
  | 'JOIN_REQUEST_REJECTED'
  | 'MATCH_CANCELLED'
  | 'MATCH_MESSAGE'
  | 'BOARDGAME_APPROVED'
  | 'BOARDGAME_REJECTED'
  | 'OFFER_MESSAGE'
  | 'OFFER_ACCEPTED'

export type AppNotification = {
  id: string
  type: NotificationType
  read: boolean
  /** Última atividade (ISO-8601 UTC) */
  createdAt: string
  /** Mensagens agrupadas (MATCH_MESSAGE) */
  count: number
  actor: { id: string; name: string } | null
  /** cancelReason: motivo dado pelo host (MATCH_CANCELLED) */
  match: { id: string; gameName: string; scheduledAt: string; cancelReason?: string | null } | null
  boardgame: { id: string; name: string } | null
  /** OFFER_*: a negociação do anúncio */
  negotiation?: { id: string; gameName: string; offerId: string } | null
  /** MATCH_MESSAGE: a outra pessoa da conversa direta; null = mesa */
  threadUserId: string | null
}

/** Texto da notificação, montado a partir do tipo e dos vínculos */
export function notificationText(n: AppNotification): string {
  const who = n.actor?.name ?? 'Alguém'
  const game = n.match?.gameName ?? n.boardgame?.name ?? n.negotiation?.gameName ?? 'o jogo'
  switch (n.type) {
    case 'JOIN_REQUEST_RECEIVED':
      return `${who} pediu para entrar na sua partida de ${game}.`
    case 'JOIN_REQUEST_WITHDRAWN':
      return `${who} desistiu da sua partida de ${game}.`
    case 'JOIN_REQUEST_ACCEPTED':
      return `${who} aceitou você na partida de ${game}.`
    case 'JOIN_REQUEST_REJECTED':
      return `${who} recusou o seu pedido na partida de ${game}.`
    case 'MATCH_CANCELLED':
      return n.match?.cancelReason
        ? `A partida de ${game} foi cancelada pelo host: “${n.match.cancelReason}”`
        : `A partida de ${game} foi cancelada pelo host.`
    case 'MATCH_MESSAGE': {
      const where = n.threadUserId ? 'no chat com você' : 'na mesa'
      return n.count > 1
        ? `${n.count} mensagens novas ${where} da partida de ${game}.`
        : `${who} mandou uma mensagem ${where} da partida de ${game}.`
    }
    case 'BOARDGAME_APPROVED':
      return `${game} foi aprovado e já está na Wiki.`
    case 'BOARDGAME_REJECTED':
      return `${game} não foi aprovado para a Wiki.`
    case 'OFFER_MESSAGE':
      return n.count > 1
        ? `${n.count} mensagens novas na negociação de ${game}.`
        : `${who} mandou uma mensagem na negociação de ${game}.`
    case 'OFFER_ACCEPTED':
      return `${who} aceitou sua proposta por ${game}. Negócio fechado!`
  }
}

/** Para onde a notificação leva ao ser clicada */
export function notificationHref(n: AppNotification): string {
  // Negociação: abre a caixa de conversas direto nela, na aba de negociações da Loja
  if (n.negotiation) return `/loja?aba=negociacoes&conversa=neg:${n.negotiation.id}`
  if (n.match) {
    // Página da partida; mensagem abre a conversa certa (mesa ou a pessoa)
    const chat = n.type === 'MATCH_MESSAGE' ? `?chat=${encodeURIComponent(n.threadUserId ?? 'mesa')}` : ''
    return `/jogue/partida/${encodeURIComponent(n.match.id)}${chat}`
  }
  if (n.type === 'BOARDGAME_REJECTED') return '/estante'
  return '/'
}
