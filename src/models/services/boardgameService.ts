import type { Boardgame, ListBoardgamesParams } from '../boardgame'
import { apiGet, apiPost, apiPut } from './apiClient'
import { forgetGame } from './shelfService'

export function listBoardgames(params: ListBoardgamesParams, signal?: AbortSignal) {
  return apiGet<Boardgame[]>('/boardgames', params, signal)
}

/** Corpo de POST/PUT /boardgames: a API exige todos os campos (descrição e números não aceitam nulo) */
export type BoardgameInput = {
  name: string
  description: string
  releaseYear: number
  playerNumber: number
  playTime: number
}

export function createBoardgame(input: BoardgameInput) {
  return apiPost<Boardgame>('/boardgames', input)
}

export async function updateBoardgame(id: string, input: BoardgameInput) {
  const saved = await apiPut<Boardgame>(`/boardgames/${id}`, input)
  forgetGame(id)
  return saved
}

export function getBoardgameById(id: string, signal?: AbortSignal) {
  return apiGet<Boardgame>(`/boardgames/${encodeURIComponent(id)}`, {}, signal)
}
