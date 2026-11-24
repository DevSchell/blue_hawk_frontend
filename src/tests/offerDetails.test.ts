import test from 'node:test'
import assert from 'node:assert/strict'
import { conditionLabel, deliveryLabel, validateOfferDetails } from '../models/offerDetails.ts'

const ok = {
  price: '150,50',
  condition: 'MUITO_BOM' as const,
  deliveryMethod: 'ENVIO' as const,
  description: '  Completo, com sleeves e a expansão.  ',
}

test('Anúncio - rascunho válido vira o pedido da API (preço e descrição limpos)', () => {
  const { value, error } = validateOfferDetails(ok)
  assert.strictEqual(error, null)
  assert.deepStrictEqual(value, {
    price: 150.5,
    condition: 'MUITO_BOM',
    deliveryMethod: 'ENVIO',
    description: 'Completo, com sleeves e a expansão.',
  })
})

test('Anúncio - preço, estado, entrega e descrição são obrigatórios', () => {
  assert.match(validateOfferDetails({ ...ok, price: '0' }).error ?? '', /preço/)
  assert.match(validateOfferDetails({ ...ok, condition: null }).error ?? '', /estado/)
  assert.match(validateOfferDetails({ ...ok, deliveryMethod: null }).error ?? '', /entrega/)
  assert.match(validateOfferDetails({ ...ok, description: 'curto' }).error ?? '', /10 caracteres/)
  assert.match(validateOfferDetails({ ...ok, description: 'x'.repeat(501) }).error ?? '', /500/)
})

test('Anúncio - entrega com o texto de quem anuncia e de quem compra', () => {
  assert.strictEqual(deliveryLabel('RETIRADA', 'seller'), 'Cliente cuida da retirada')
  assert.strictEqual(deliveryLabel('RETIRADA', 'buyer'), 'Você cuida da retirada')
  assert.strictEqual(deliveryLabel('ENVIO', 'seller'), 'Você cuida da entrega')
  assert.strictEqual(deliveryLabel('ENVIO', 'buyer'), 'Anunciante cuida da entrega')
  assert.strictEqual(deliveryLabel(null, 'buyer'), 'A combinar')
})

test('Anúncio - rótulo do estado de conservação', () => {
  assert.strictEqual(conditionLabel('NOVO_LACRADO'), 'Novo (lacrado)')
  assert.strictEqual(conditionLabel(null), null)
})
