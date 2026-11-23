/** Anúncio da vitrine da Loja (GET /store/offers): já traz o jogo e o vendedor */
export type StoreOffer = {
  id: string
  price: number
  description: string | null
  createdAt: string | null
  sellerName: string
  isMine: boolean
  game: {
    id: string
    name: string
    description: string | null
    category: string | null
    coverPreset: string | null
    /** Caminho relativo à API */
    coverImageUrl: string | null
    playerNumber: number | null
    playTime: number | null
    releaseYear: number | null
  }
}

export type StoreSort = 'recent' | 'price'
