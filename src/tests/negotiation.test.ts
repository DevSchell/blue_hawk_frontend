import test from 'node:test'
import assert from 'node:assert/strict'
import { filterInbox, negotiationKey, type ChatInboxItem } from '../models/chatInbox.ts'
import { parseProposedPrice } from '../models/negotiation.ts'

test('Negociação - preço vazio é proposta nenhuma', () => {
  assert.deepStrictEqual(parseProposedPrice(''), { value: null, error: null })
  assert.deepStrictEqual(parseProposedPrice('   '), { value: null, error: null })
})

test('Negociação - aceita vírgula, ponto de milhar e arredonda centavos', () => {
  assert.strictEqual(parseProposedPrice('150').value, 150)
  assert.strictEqual(parseProposedPrice('150,5').value, 150.5)
  assert.strictEqual(parseProposedPrice('1.250,99').value, 1250.99)
  assert.strictEqual(parseProposedPrice('10,005').value, 10.01)
})

test('Negociação - recusa zero, negativo, texto e valor alto demais', () => {
  assert.ok(parseProposedPrice('0').error)
  assert.ok(parseProposedPrice('-5').error)
  assert.ok(parseProposedPrice('abc').error)
  assert.ok(parseProposedPrice('100000000').error)
})

const item = (kind: ChatInboxItem['kind'], key: string): ChatInboxItem => ({
  key,
  kind,
  title: 'Catan',
  subtitle: '',
  matchId: kind === 'NEGOTIATION' ? null : 'm1',
  withUserId: null,
  negotiationId: kind === 'NEGOTIATION' ? key.slice(4) : null,
  status: 'OPEN',
  unread: 0,
  lastActivityAt: '2026-11-24T12:00:00Z',
  lastMessage: null,
})

test('Caixa de conversas - filtros de mesas e negociações', () => {
  const items = [item('MATCH_TABLE', 'match:m1:table'), item('MATCH_DIRECT', 'match:m1:u2'), item('NEGOTIATION', 'neg:n1')]
  assert.strictEqual(filterInbox(items, 'todas').length, 3)
  assert.deepStrictEqual(
    filterInbox(items, 'mesas').map((i) => i.key),
    ['match:m1:table', 'match:m1:u2'],
  )
  assert.deepStrictEqual(
    filterInbox(items, 'negociacoes').map((i) => i.key),
    ['neg:n1'],
  )
  assert.strictEqual(negotiationKey('n1'), 'neg:n1')
})
