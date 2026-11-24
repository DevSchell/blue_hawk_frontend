import test from 'node:test'
import assert from 'node:assert/strict'
import { notificationHref, notificationText, type AppNotification } from '../models/notification.ts'

const base: AppNotification = {
  id: 'n1',
  type: 'JOIN_REQUEST_RECEIVED',
  read: false,
  createdAt: '2026-11-24T12:00:00Z',
  count: 1,
  actor: { id: 'u2', name: 'Ana' },
  match: { id: 'm1', gameName: 'Catan', scheduledAt: '2026-11-30T22:00:00Z' },
  boardgame: null,
  threadUserId: null,
}

test('Notificações - texto de pedido, resposta e cancelamento', () => {
  assert.strictEqual(notificationText(base), 'Ana pediu para entrar na sua partida de Catan.')
  assert.strictEqual(
    notificationText({ ...base, type: 'JOIN_REQUEST_ACCEPTED' }),
    'Ana aceitou você na partida de Catan.',
  )
  assert.strictEqual(
    notificationText({ ...base, type: 'MATCH_CANCELLED' }),
    'A partida de Catan foi cancelada pelo host.',
  )
})

test('Notificações - mensagens agrupadas na mesa e no chat direto', () => {
  const message = { ...base, type: 'MATCH_MESSAGE' as const }
  assert.strictEqual(notificationText(message), 'Ana mandou uma mensagem na mesa da partida de Catan.')
  assert.strictEqual(
    notificationText({ ...message, count: 3, threadUserId: 'u2' }),
    '3 mensagens novas no chat com você da partida de Catan.',
  )
})

test('Notificações - sem ator, usa "Alguém"; jogo da Wiki usa o nome do jogo', () => {
  assert.strictEqual(notificationText({ ...base, actor: null }), 'Alguém pediu para entrar na sua partida de Catan.')
  assert.strictEqual(
    notificationText({ ...base, type: 'BOARDGAME_APPROVED', match: null, boardgame: { id: 'b1', name: 'Azul' } }),
    'Azul foi aprovado e já está na Wiki.',
  )
})

test('Notificações - links levam à partida e à conversa certa', () => {
  assert.strictEqual(notificationHref(base), '/jogue/partida/m1')
  assert.strictEqual(
    notificationHref({ ...base, type: 'MATCH_MESSAGE' }),
    '/jogue/partida/m1?chat=mesa',
  )
  assert.strictEqual(
    notificationHref({ ...base, type: 'MATCH_MESSAGE', threadUserId: 'u2' }),
    '/jogue/partida/m1?chat=u2',
  )
  assert.strictEqual(
    notificationHref({ ...base, type: 'BOARDGAME_REJECTED', match: null, boardgame: { id: 'b1', name: 'Azul' } }),
    '/estante',
  )
})

test('Notificações - negociação da Loja: texto e link para a conversa', () => {
  const offer = {
    ...base,
    type: 'OFFER_MESSAGE' as const,
    match: null,
    negotiation: { id: 'g1', gameName: 'Azul', offerId: 'o1' },
  }
  assert.strictEqual(notificationText(offer), 'Ana mandou uma mensagem na negociação de Azul.')
  assert.strictEqual(notificationText({ ...offer, count: 2 }), '2 mensagens novas na negociação de Azul.')
  assert.strictEqual(
    notificationText({ ...offer, type: 'OFFER_ACCEPTED' }),
    'Ana aceitou sua proposta por Azul. Negócio fechado!',
  )
  assert.strictEqual(notificationHref(offer), '/loja?aba=negociacoes&conversa=neg:g1')
})
