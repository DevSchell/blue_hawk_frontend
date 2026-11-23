import type { Boardgame } from './boardgame'
import type { Match, Offer, UserBoardgame } from './market'

export type { Match, Offer, UserBoardgame }

export type ShelfGame = {
  userBoardgameId: string
  boardgame: Boardgame
  category: string
  plays: number
  hours: number
  forSale: boolean
  salePrice: number
  offerId: string | null
}

export type PlayersFilterOption = 'any' | '1' | '2' | '3-4' | '5+'
export type ShelfSortOption = 'most-played' | 'most-hours' | 'az' | 'za' | 'duration-asc'

export const DEFAULT_SALE_PRICE = 150

export const SHELF_CATEGORIES = ['Todas', 'Estratégia', 'Cooperativo', 'Família', 'Party', 'Cartas', 'Abstrato'] as const

const PREVIEW_CATEGORIES = ['Estratégia', 'Cooperativo', 'Família', 'Party', 'Cartas', 'Abstrato']

export function resolveGameCategory(game: Boardgame): string {
  if (game.category) return game.category
  let hash = 0
  for (const char of game.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PREVIEW_CATEGORIES[hash % PREVIEW_CATEGORIES.length]
}
