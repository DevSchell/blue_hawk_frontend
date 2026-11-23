import type { ApprovalStatus, Boardgame, BoardgameInput, Category, ListBoardgamesParams } from '../boardgame'
import { apiDeleteJson, apiGet, apiPost, apiPostForm, apiPut, apiUrl } from './apiClient'
import { forgetGame } from './shelfService'

export type { BoardgameInput }

export function listBoardgames(params: ListBoardgamesParams, signal?: AbortSignal) {
  return apiGet<Boardgame[]>('/boardgames', params, signal)
}

export function getBoardgameById(id: string, signal?: AbortSignal) {
  return apiGet<Boardgame>(`/boardgames/${encodeURIComponent(id)}`, {}, signal)
}

/** Categorias da tabela category (públicas) */
export function listCategories(signal?: AbortSignal) {
  return apiGet<Category[]>('/categories', {}, signal)
}

/**
 * Cadastra um jogo. Usuário comum: entra PENDING e já vai para a estante dele (userBoardgameId).
 * Admin: entra APPROVED direto no catálogo, sem cópia na estante.
 */
export function createBoardgame(input: BoardgameInput) {
  return apiPost<Boardgame>('/boardgames', input)
}

/** Autor corrige o próprio jogo não aprovado (um recusado volta para a fila); admin edita qualquer um */
export async function updateBoardgame(id: string, input: BoardgameInput) {
  const saved = await apiPut<Boardgame>(`/boardgames/${encodeURIComponent(id)}`, input)
  // A estante guarda os jogos já carregados: descarta a versão antiga
  forgetGame(id)
  return saved
}

/** Envia a foto de capa (JPEG, PNG ou WebP até 2 MB) */
export function uploadBoardgameCover(id: string, image: Blob) {
  const form = new FormData()
  form.append('file', image, 'capa')
  return apiPostForm<Boardgame>(`/boardgames/${encodeURIComponent(id)}/cover`, form)
}

/** Remove a foto: a capa volta a ser a arte escolhida (ou a automática) */
export function removeBoardgameCover(id: string) {
  return apiDeleteJson<Boardgame>(`/boardgames/${encodeURIComponent(id)}/cover`)
}

/** Props de capa para o GameCover: a foto enviada (URL completa) ou a arte escolhida */
export function coverOf(game: Boardgame) {
  return {
    preset: game.coverPreset ?? null,
    imageUrl: game.coverImageUrl ? apiUrl(game.coverImageUrl) : null,
  }
}

/** Ranking "Mais curtidos" (só aprovados) */
export function listMostLiked(size: number, signal?: AbortSignal) {
  return apiGet<Boardgame[]>('/boardgames', { sort: 'likes', page: 0, size }, signal)
}

export type LikeResult = { boardgameId: string; likeCount: number; likedByMe: boolean }

export function likeBoardgame(id: string) {
  return apiPost<LikeResult>(`/boardgames/${encodeURIComponent(id)}/like`, {})
}

export function unlikeBoardgame(id: string) {
  return apiDeleteJson<LikeResult>(`/boardgames/${encodeURIComponent(id)}/like`)
}

/** Fila de aprovação (só admin) */
export function listBoardgamesForReview(status: Exclude<ApprovalStatus, 'APPROVED'>, signal?: AbortSignal) {
  return apiGet<Boardgame[]>('/boardgames', { status, page: 0, size: 100 }, signal)
}

export function approveBoardgame(id: string) {
  return apiPost<Boardgame>(`/boardgames/${encodeURIComponent(id)}/approve`, {})
}

export function rejectBoardgame(id: string, reason: string) {
  return apiPost<Boardgame>(`/boardgames/${encodeURIComponent(id)}/reject`, { reason: reason || null })
}
