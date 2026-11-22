import type { Match, MatchParticipant, MatchWithPlayers, Offer, UserBoardgame } from '../market'
import { apiGet, apiPost } from './apiClient'

/** Tamanho de página usado nas listas da modal do jogo (a API pagina tudo, padrão 10) */
const PAGE_SIZE = 50

/** Ofertas ativas de um jogo */
export function listActiveOffers(boardgameId: string, signal?: AbortSignal) {
  return apiGet<Offer[]>('/offers', { boardgameId, status: 'ACTIVE', size: PAGE_SIZE }, signal)
}

/** Cópias do jogo nas estantes dos usuários: dizem quem é dono de cada oferta e partida */
export function listCopies(boardgameId: string, signal?: AbortSignal) {
  return apiGet<UserBoardgame[]>('/user-boardgames', { boardgameId, size: PAGE_SIZE }, signal)
}

/**
 * Partidas de um jogo. A API só filtra partidas por cópia (userBoardgameId),
 * então busca as partidas de cada cópia e, de cada partida, os participantes.
 */
export async function listMatches(copies: UserBoardgame[], signal?: AbortSignal): Promise<MatchWithPlayers[]> {
  const perCopy = await Promise.all(
    copies.map((copy) => apiGet<Match[]>('/matches', { userBoardgameId: copy.id, size: PAGE_SIZE }, signal)),
  )
  const matches = perCopy.flat()

  return Promise.all(
    matches.map(async (match) => {
      const players = await apiGet<MatchParticipant[]>(
        '/match-participants',
        { matchId: match.id, size: PAGE_SIZE },
        signal,
      )
      return { ...match, participantIds: players.map((p) => p.userId), participants: players }
    }),
  )
}

export function joinMatch(matchId: string, userId: string) {
  return apiPost<MatchParticipant>('/match-participants', { matchId, userId })
}

/** Põe o jogo na estante do usuário; uma oferta precisa partir de uma cópia dele */
export function addCopy(userId: string, boardgameId: string) {
  return apiPost<UserBoardgame>('/user-boardgames', { userId, boardgameId })
}

export function createOffer(userBoardgameId: string, price: number, description: string) {
  return apiPost<Offer>('/offers', {
    userBoardgameId,
    price,
    status: 'ACTIVE',
    description: description || null,
  })
}
