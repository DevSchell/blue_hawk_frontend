import type { Boardgame } from '../../../models/boardgame.ts'
import type { Match } from '../../../models/market.ts'
import {
  formatDuration,
  formatMatchDate,
  formatMatchDuration,
  formatMatchFullDate,
  formatPlayers,
} from '../../features/boardgames/format.ts'

export {
  formatDuration,
  formatMatchDate,
  formatMatchDuration,
  formatMatchFullDate,
  formatPlayers,
}

/**
 * Determina a data da partida. Se a API informar date, playedAt ou createdAt, usa o valor.
 * Caso contrário, gera uma data determinística baseada no ID da partida para manter
 * consistência visual no histórico.
 */
export function resolveMatchDate(match: Match): Date {
  const raw = match.date || match.playedAt || match.createdAt
  if (raw) {
    const parsed = new Date(raw)
    if (!isNaN(parsed.getTime())) return parsed
  }
  let hash = 0
  const idStr = String(match.id || 'partida')
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0
  }
  const daysAgo = (hash % 45) + 1
  const hours = hash % 24
  const minutes = (hash * 7) % 60
  const baseEpoch = 1795450000000 // nov 2026
  return new Date(baseEpoch - daysAgo * 86400000 + hours * 3600000 + minutes * 60000)
}

/**
 * Determina a duração da partida em minutos. Se a partida possuir duração explicitada, usa-a.
 * Senão, recorre ao playTime do jogo ou gera um valor determinístico plausível (30-120min).
 */
export function resolveMatchDuration(
  match: Match,
  game?: Boardgame | null,
): number {
  if (match.duration && match.duration > 0) return match.duration
  if (game?.playTime && game.playTime > 0) return game.playTime
  let hash = 0
  const idStr = String(match.id || 'duracao')
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0
  }
  const durations = [30, 45, 60, 75, 90, 120]
  return durations[hash % durations.length]
}
