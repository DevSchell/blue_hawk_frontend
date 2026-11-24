/** Negociação de um anúncio da Loja: conversa entre comprador e vendedor, com propostas de preço */

export const NEGOTIATION_MESSAGE_MAX = 1000
/** Maior preço aceito pela API (DECIMAL(10,2)) */
export const PRICE_MAX = 99999999.99

export type NegotiationStatus = 'OPEN' | 'ACCEPTED' | 'CLOSED'

export type Negotiation = {
  id: string
  status: NegotiationStatus
  agreedPrice: number | null
  isSeller: boolean
  offer: {
    id: string
    price: number
    status: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'CANCELLED'
    game: { id: string; name: string; coverPreset: string | null; coverImageUrl: string | null }
  }
  buyer: { id: string; name: string }
  seller: { id: string; name: string }
}

export type NegotiationMessage = {
  id: string
  senderId: string
  senderName: string
  body: string
  /** Proposta de preço junto da mensagem */
  proposedPrice: number | null
  createdAt: string
  mine: boolean
}

/** Valida o preço digitado ("150", "150,50"): devolve o número ou uma mensagem de erro */
export function parseProposedPrice(raw: string): { value: number | null; error: string | null } {
  const text = raw.trim()
  if (!text) return { value: null, error: null }
  const value = Number(text.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return { value: null, error: 'Informe um preço maior que zero.' }
  if (value > PRICE_MAX) return { value: null, error: 'Preço alto demais.' }
  return { value: Math.round(value * 100) / 100, error: null }
}
