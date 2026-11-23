/** Situação do jogo no catálogo: só APPROVED aparece na Wiki */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** BoardgameResponse da API (presentation/boardgame/BoardgameResponse.java) */
export type Boardgame = {
  id: string
  name: string
  description: string | null
  releaseYear: number | null
  playerNumber: number | null
  playTime: number | null
  /** Ausente em respostas antigas: tratamos como aprovado */
  approvalStatus?: ApprovalStatus
  /** Id do usuário que cadastrou */
  submittedBy?: string | null
  /** Motivo informado pelo admin ao recusar */
  reviewNote?: string | null
  /** Só no cadastro feito por usuário comum: a cópia criada na estante dele */
  userBoardgameId?: string | null
  /** Nome da categoria (tabela category). Jogos antigos podem vir sem: a UI mostra uma prévia. */
  category?: string | null
  categoryId?: string | null
  /** Arte do site escolhida como capa; null = automática */
  coverPreset?: string | null
  /** Caminho da foto enviada, relativo à API (tem prioridade sobre a arte) */
  coverImageUrl?: string | null
  /** Total de curtidas */
  likeCount?: number
  /** Se quem está vendo curtiu (sempre false para visitantes) */
  likedByMe?: boolean
  publisher?: string | null
}

/** CategoryResponse da API (GET /categories) */
export type Category = {
  id: string
  name: string
}

/** Query de GET /boardgames */
export type ListBoardgamesParams = {
  name?: string
  /** Padrão da API: APPROVED. PENDING/REJECTED só para admin. */
  status?: ApprovalStatus
  page?: number
  size?: number
}

/** Corpo de POST/PUT /boardgames (BoardgameRequest) */
export type BoardgameInput = {
  name: string
  description: string
  releaseYear: number
  playerNumber: number
  playTime: number
  categoryId: string
  /** null = arte automática (ou foto enviada depois, em POST /boardgames/{id}/cover) */
  coverPreset: string | null
}

/** Limite da foto de capa na API */
export const COVER_IMAGE_MAX_BYTES = 2 * 1024 * 1024

/** Limites das colunas de board_game (validados também pela API) */
export const BOARDGAME_NAME_MAX = 150
export const BOARDGAME_DESCRIPTION_MAX = 150
export const REJECT_REASON_MAX = 500

export function approvalStatusOf(game: Boardgame): ApprovalStatus {
  return game.approvalStatus ?? 'APPROVED'
}
