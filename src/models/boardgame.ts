/** BoardgameResponse da API (presentation/boardgame/BoardgameResponse.java) */
export type Boardgame = {
  id: string
  name: string
  description: string | null
  releaseYear: number | null
  playerNumber: number | null
  playTime: number | null
}

/** Query de GET /boardgames */
export type ListBoardgamesParams = {
  name?: string
  page?: number
  size?: number
}
