import type { Boardgame, ListBoardgamesParams } from '../boardgame'
import { apiGet } from './apiClient'

export function listBoardgames(params: ListBoardgamesParams, signal?: AbortSignal) {
  return apiGet<Boardgame[]>('/boardgames', params, signal)
}
