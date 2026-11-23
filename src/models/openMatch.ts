/** Tipos do matchmaking ("Jogue"): OpenMatchController da API */

export type OpenMatchStatus = 'OPEN' | 'CANCELLED'
export type JoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export type OpenMatchGame = {
  id: string
  name: string
  category: string | null
  coverPreset: string | null
  /** Caminho relativo à API */
  coverImageUrl: string | null
  playerNumber: number | null
  playTime: number | null
}

export type OpenMatch = {
  id: string
  status: OpenMatchStatus
  city: string
  /** ISO-8601 UTC */
  scheduledAt: string
  /** Total de jogadores na mesa, contando o host */
  maxPlayers: number
  /** Host + aceitos */
  players: number
  seatsLeft: number
  /** Só vem para o host */
  pendingRequests: number | null
  notes: string | null
  host: { id: string; name: string }
  game: OpenMatchGame | null
  isHost: boolean
  /** Pedido de quem está vendo (null se não pediu) */
  myRequest: { id: string; status: JoinRequestStatus; message: string; hostReply: string | null } | null
}

/** Pedido visto pelo host */
export type JoinRequest = {
  id: string
  userId: string
  userName: string
  message: string
  status: JoinRequestStatus
  hostReply: string | null
  createdAt: string
}

export type HostMatchInput = {
  userBoardgameId: string
  city: string
  /** ISO-8601 com fuso */
  scheduledAt: string
  maxPlayers: number
  notes: string | null
}

export const MATCH_TEXT_MAX = 500
export const CITY_MAX = 100
