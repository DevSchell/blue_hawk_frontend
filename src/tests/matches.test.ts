import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatDuration,
  formatMatchDate,
  formatMatchFullDate,
  formatPlayers,
  resolveMatchDate,
  resolveMatchDuration,
} from '../views/pages/MatchesPage/matchesUtils.ts'
import type { Boardgame } from '../models/boardgame.ts'
import type { Match } from '../models/market.ts'

test('Matches - formatação de duração da partida (formatDuration)', () => {
  assert.strictEqual(formatDuration(null), 'Duração não informada')
  assert.strictEqual(formatDuration(undefined), 'Duração não informada')
  assert.strictEqual(formatDuration(0), 'Duração não informada')
  assert.strictEqual(formatDuration(-10), 'Duração não informada')

  assert.strictEqual(formatDuration(30), '30 min')
  assert.strictEqual(formatDuration(45), '45 min')
  assert.strictEqual(formatDuration(59), '59 min')

  assert.strictEqual(formatDuration(60), '1h')
  assert.strictEqual(formatDuration(120), '2h')

  assert.strictEqual(formatDuration(75), '1h 15min')
  assert.strictEqual(formatDuration(90), '1h 30min')
  assert.strictEqual(formatDuration(135), '2h 15min')
})

test('Matches - formatação de data da partida (formatMatchDate e formatMatchFullDate)', () => {
  assert.strictEqual(formatMatchDate(null), 'Data não informada')
  assert.strictEqual(formatMatchDate(undefined), 'Data não informada')
  assert.strictEqual(formatMatchDate('invalid-date'), 'Data não informada')

  const sampleDate = new Date(2026, 10, 23, 15, 30) // 23 de nov. de 2026
  const formatted = formatMatchDate(sampleDate)
  assert.strictEqual(formatted, '23/11/2026')

  const fullFormatted = formatMatchFullDate(sampleDate)
  assert.match(fullFormatted, /23 de novembro de 2026/)
})

test('Matches - resolução de data da partida com fallback determinístico (resolveMatchDate)', () => {
  // 1. Data explícita em match.date
  const matchWithDate: Match = {
    id: 'm-1',
    userBoardgameId: 'ubg-1',
    maxUsers: 4,
    date: '2026-11-20T14:00:00Z',
  }
  const date1 = resolveMatchDate(matchWithDate)
  assert.strictEqual(date1.toISOString(), '2026-11-20T14:00:00.000Z')

  // 2. Data explícita em match.playedAt
  const matchWithPlayedAt: Match = {
    id: 'm-2',
    userBoardgameId: 'ubg-2',
    maxUsers: 4,
    playedAt: '2026-11-15T10:00:00Z',
  }
  const date2 = resolveMatchDate(matchWithPlayedAt)
  assert.strictEqual(date2.toISOString(), '2026-11-15T10:00:00.000Z')

  // 3. Data explícita em match.createdAt
  const matchWithCreatedAt: Match = {
    id: 'm-3',
    userBoardgameId: 'ubg-3',
    maxUsers: 4,
    createdAt: '2026-11-10T18:00:00Z',
  }
  const date3 = resolveMatchDate(matchWithCreatedAt)
  assert.strictEqual(date3.toISOString(), '2026-11-10T18:00:00.000Z')

  // 4. Fallback determinístico quando nenhuma data é fornecida pela API
  const matchWithoutDate: Match = {
    id: 'match-xyz-789',
    userBoardgameId: 'ubg-4',
    maxUsers: 4,
  }
  const fallbackDate = resolveMatchDate(matchWithoutDate)
  assert.ok(fallbackDate instanceof Date)
  assert.ok(!isNaN(fallbackDate.getTime()))

  // Verificação de determinismo: mesmo ID deve gerar a mesma data exata
  const fallbackDateRepeat = resolveMatchDate(matchWithoutDate)
  assert.strictEqual(fallbackDate.getTime(), fallbackDateRepeat.getTime())
})

test('Matches - resolução de duração da partida com prioridade e fallback (resolveMatchDuration)', () => {
  const game: Boardgame = {
    id: 'bg-1',
    name: 'Catan',
    description: 'Jogo de colonização e comércio',
    releaseYear: 1995,
    playerNumber: 4,
    playTime: 75,
  }

  // 1. Duração explícita na partida tem precedência
  const matchWithDuration: Match = {
    id: 'm-1',
    userBoardgameId: 'ubg-1',
    maxUsers: 4,
    duration: 90,
  }
  assert.strictEqual(resolveMatchDuration(matchWithDuration, game), 90)

  // 2. Sem duração na partida, recorre ao playTime do jogo
  const matchWithoutDuration: Match = {
    id: 'm-2',
    userBoardgameId: 'ubg-2',
    maxUsers: 4,
  }
  assert.strictEqual(resolveMatchDuration(matchWithoutDuration, game), 75)

  // 3. Sem duração na partida e sem playTime no jogo, recorre ao fallback determinístico
  const gameWithoutTime: Boardgame = {
    id: 'bg-2',
    name: 'Mysterium',
    description: null,
    releaseYear: null,
    playerNumber: null,
    playTime: null,
  }
  const duration = resolveMatchDuration(matchWithoutDuration, gameWithoutTime)
  assert.ok(duration > 0)
  assert.ok([30, 45, 60, 75, 90, 120].includes(duration))

  // Determinismo
  assert.strictEqual(resolveMatchDuration(matchWithoutDuration, gameWithoutTime), duration)
})

test('Matches - formatação de jogadores para o resumo do card e modal', () => {
  assert.strictEqual(formatPlayers(1), '1 jogador')
  assert.strictEqual(formatPlayers(4), '4 jogadores')
})
