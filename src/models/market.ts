/** OfferResponse da API (presentation/offer/dto/OfferResponse.java) */
export type Offer = {
  id: string
  userBoardgameId: string
  /** BigDecimal: chega como número no JSON */
  price: number
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'CANCELLED'
  description: string | null
  createdAt: string
  updatedAt: string
}

/** UserBoardgameResponse: a cópia de um jogo que pertence a um usuário */
export type UserBoardgame = {
  id: string
  userId: string
  boardgameId: string
}

/** MatchResponse */
export type Match = {
  id: string
  userBoardgameId: string
  maxUsers: number | null
}

/** MatchParticipantResponse */
export type MatchParticipant = {
  id: string
  matchId: string
  userId: string
}

/** Partida com quem já está nela; a API não lista partidas por jogo, então isso é montado no front */
export type MatchWithPlayers = Match & {
  participantIds: string[]
}
