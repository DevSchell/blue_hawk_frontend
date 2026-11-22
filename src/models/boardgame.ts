/** BoardgameResponse da API (presentation/boardgame/BoardgameResponse.java) */
export type Boardgame = {
  id: string
  name: string
  description: string | null
  releaseYear: number | null
  playerNumber: number | null
  playTime: number | null
  /** Ainda não vem da API; quando vier, a UI passa a usar este valor no lugar da prévia */
  category?: string | null
}

/** Query de GET /boardgames */
export type ListBoardgamesParams = {
  name?: string
  page?: number
  size?: number
}
