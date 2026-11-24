import test from 'node:test'
import assert from 'node:assert/strict'
import { AVATAR_PRESETS, presetDataUri, presetIdOf } from '../models/avatarPresets.ts'
import { levelApi, levelLabel, splitGenres } from '../models/userProfile.ts'

test('Perfil - nível de experiência vai e volta entre a API e a tela', () => {
  assert.strictEqual(levelLabel('INTERMEDIARIO'), 'Intermediário')
  assert.strictEqual(levelApi('Intermediário'), 'INTERMEDIARIO')
  assert.strictEqual(levelApi('Veterano'), 'VETERANO')
  assert.strictEqual(levelLabel(null), undefined)
  assert.strictEqual(levelApi(undefined), null)
})

test('Perfil - estilos favoritos viram lista limpa e limitada', () => {
  assert.deepStrictEqual(splitGenres(' Eurogames, , Catan ,Party games '), ['Eurogames', 'Catan', 'Party games'])
  assert.deepStrictEqual(splitGenres(null), [])
  assert.strictEqual(splitGenres('a,b,c,d,e,f,g,h').length, 6)
})

test('Perfil - avatar escolhido é achado pelo id (e o id pela imagem)', () => {
  const preset = AVATAR_PRESETS[0]
  assert.strictEqual(presetDataUri(preset.id), preset.dataUri)
  assert.strictEqual(presetIdOf(preset.dataUri), preset.id)
  assert.strictEqual(presetDataUri('nao-existe'), null)
})
