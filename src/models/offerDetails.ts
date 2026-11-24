/** Dados de um anúncio da Loja: preço, estado de conservação, formas de entrega e descrição */

export type OfferCondition = 'NOVO_LACRADO' | 'COMO_NOVO' | 'MUITO_BOM' | 'BOM' | 'COM_MARCAS_DE_USO'
export type DeliveryMethod = 'A_COMBINAR' | 'RETIRADA' | 'ENVIO'

export const OFFER_CONDITIONS: { value: OfferCondition; label: string; hint: string }[] = [
  { value: 'NOVO_LACRADO', label: 'Novo (lacrado)', hint: 'Nunca aberto, ainda no plástico.' },
  { value: 'COMO_NOVO', label: 'Como novo', hint: 'Aberto, componentes completos e sem marcas.' },
  { value: 'MUITO_BOM', label: 'Muito bom', hint: 'Pouco jogado, sinais leves só na caixa.' },
  { value: 'BOM', label: 'Bom', hint: 'Usado com cuidado, desgaste normal de mesa.' },
  { value: 'COM_MARCAS_DE_USO', label: 'Com marcas de uso', hint: 'Bem jogado: caixa ou peças com marcas.' },
]

/**
 * Forma de entrega (uma só). {@code label}: como quem anuncia vê; {@code buyerLabel}: como quem compra vê.
 */
export const DELIVERY_METHODS: { value: DeliveryMethod; label: string; buyerLabel: string; hint: string }[] = [
  { value: 'A_COMBINAR', label: 'A combinar', buyerLabel: 'A combinar', hint: 'Vocês decidem juntos pela conversa.' },
  {
    value: 'RETIRADA',
    label: 'Cliente cuida da retirada',
    buyerLabel: 'Você cuida da retirada',
    hint: 'Quem compra busca o jogo com você.',
  },
  {
    value: 'ENVIO',
    label: 'Você cuida da entrega',
    buyerLabel: 'Anunciante cuida da entrega',
    hint: 'Você leva ou envia o jogo para quem comprar.',
  },
]

export const OFFER_DESCRIPTION_MIN = 10
export const OFFER_DESCRIPTION_MAX = 500

export type OfferDetailsInput = {
  price: number
  condition: OfferCondition
  deliveryMethod: DeliveryMethod
  description: string
}

export type OfferDetailsDraft = {
  price: string
  condition: OfferCondition | null
  deliveryMethod: DeliveryMethod | null
  description: string
}

/** Valida o rascunho do formulário: o anúncio pronto para a API ou a primeira mensagem de erro */
export function validateOfferDetails(draft: OfferDetailsDraft): { value: OfferDetailsInput | null; error: string | null } {
  const price = Number(draft.price.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(price) || price <= 0) return { value: null, error: 'Informe um preço maior que zero.' }
  if (!draft.condition) return { value: null, error: 'Escolha o estado de conservação do jogo.' }
  if (!draft.deliveryMethod) return { value: null, error: 'Escolha a forma de entrega.' }
  const description = draft.description.trim()
  if (description.length < OFFER_DESCRIPTION_MIN) {
    return {
      value: null,
      error: `Descreva o exemplar com pelo menos ${OFFER_DESCRIPTION_MIN} caracteres (o que vem na caixa, expansões, detalhes).`,
    }
  }
  if (description.length > OFFER_DESCRIPTION_MAX) {
    return { value: null, error: `A descrição pode ter até ${OFFER_DESCRIPTION_MAX} caracteres.` }
  }
  return {
    value: {
      price: Math.round(price * 100) / 100,
      condition: draft.condition,
      deliveryMethod: draft.deliveryMethod,
      description,
    },
    error: null,
  }
}

export function conditionLabel(condition: OfferCondition | null | undefined) {
  return OFFER_CONDITIONS.find((c) => c.value === condition)?.label ?? null
}

/**
 * Forma de entrega em texto, do ponto de vista de quem vê: quem anunciou ({@code seller}) ou quem compra.
 * Anúncio antigo (sem forma) vira "A combinar".
 */
export function deliveryLabel(method: DeliveryMethod | null | undefined, viewer: 'seller' | 'buyer') {
  const option = DELIVERY_METHODS.find((m) => m.value === method) ?? DELIVERY_METHODS[0]
  return viewer === 'seller' ? option.label : option.buyerLabel
}
