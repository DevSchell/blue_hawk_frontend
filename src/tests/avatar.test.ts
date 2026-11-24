import test from 'node:test'
import assert from 'node:assert/strict'
import { getAvatarSizeClass, initials } from '../views/components/Avatar/avatarUtils.ts'

test('Avatar - geração de iniciais para diferentes formatos de nome', () => {
  // Nome único
  assert.strictEqual(initials('Leonardo'), 'L')

  // Nome composto
  assert.strictEqual(initials('Leonardo Schell'), 'LS')

  // Três ou mais nomes (deve limitar a duas iniciais)
  assert.strictEqual(initials('Leonardo Schell de Souza'), 'LS')

  // Múltiplos espaços e quebras de linha
  assert.strictEqual(initials('   Everton    Litka  '), 'EL')

  // Nomes com caracteres acentuados
  assert.strictEqual(initials('Álvaro Ótavio'), 'ÁÓ')

  // String vazia
  assert.strictEqual(initials(''), '')
  assert.strictEqual(initials('   '), '')
})

test('Avatar - mapeamento correto de classes CSS por tamanho (getAvatarSizeClass)', () => {
  assert.strictEqual(getAvatarSizeClass('sm'), 'avatar--sm')
  assert.strictEqual(getAvatarSizeClass('md'), 'avatar--md')
  assert.strictEqual(getAvatarSizeClass('lg'), 'avatar--lg')
  assert.strictEqual(getAvatarSizeClass('xl'), 'avatar--xl')
  assert.strictEqual(getAvatarSizeClass(), 'avatar--md')
})
