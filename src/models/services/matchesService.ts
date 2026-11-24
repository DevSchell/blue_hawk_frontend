import type { Boardgame } from '../boardgame'
import type { Match, MatchParticipant, UserBoardgame } from '../market'
import { apiDelete, apiGet, apiPost } from './apiClient'
import { fetchAll, getCopy, getGame, getUserName } from './shelfService'

export type Player = { id: string; userId: string; name: string }

/** Partida do usuário (como anfitrião ou jogador), com o jogo e quem está nela */
export type MyMatch = {
  match: Match
  game: Boardgame
  hostId: string
  hostName: string
  players: Player[]
}

export { resolveMatchDate, resolveMatchDuration } from '../../views/pages/MatchesPage/matchesUtils'

export const createMatch = (userBoardgameId: string) => apiPost<Match>('/matches', { userBoardgameId })

/** Tira um jogador da partida (ou o próprio usuário, ao sair) */
export const removeParticipant = (participantId: string) => apiDelete(`/match-participants/${participantId}`)

/** A API recusa apagar partida com jogadores (erro 500): esvazia antes */
export async function deleteMatch(matchId: string) {
  const players = await fetchAll<MatchParticipant>('/match-participants', { matchId })
  for (const player of players) await removeParticipant(player.id)
  await apiDelete(`/matches/${matchId}`)
}

/** Partidas que o usuário criou (a partir das suas cópias) ou em que participa */
export async function listMyMatches(userId: string, signal?: AbortSignal): Promise<MyMatch[]> {
  const [joined, copies] = await Promise.all([
    fetchAll<MatchParticipant>('/match-participants', { userId }, signal),
    fetchAll<UserBoardgame>('/user-boardgames', { userId }, signal),
  ])
  const hosted: Match[] = []
  for (const copy of copies) hosted.push(...(await fetchAll<Match>('/matches', { userBoardgameId: copy.id }, signal)))

  const known = new Set(hosted.map((m) => m.id))
  const others = [...new Set(joined.map((p) => p.matchId))].filter((id) => !known.has(id))
  const fetched = await Promise.all(others.map((id) => apiGet<Match>(`/matches/${id}`, {}, signal).catch(() => null)))
  const matches = [...hosted, ...fetched.filter((m): m is Match => m !== null)]

  const rows = await Promise.all(
    matches.map(async (match): Promise<MyMatch | null> => {
      try {
        const copy = await getCopy(match.userBoardgameId)
        const [game, hostName, participants] = await Promise.all([
          getGame(copy.boardgameId),
          getUserName(copy.userId).catch(() => 'Anfitrião'),
          fetchAll<MatchParticipant>('/match-participants', { matchId: match.id }, signal),
        ])
        const players = await Promise.all(
          participants.map(async (p) => ({ id: p.id, userId: p.userId, name: await getUserName(p.userId).catch(() => 'Jogador') })),
        )
        return { match, game, hostId: copy.userId, hostName, players }
      } catch {
        return null
      }
    }),
  )
  return rows.filter((row): row is MyMatch => row !== null).sort((a, b) => a.game.name.localeCompare(b.game.name))
}
