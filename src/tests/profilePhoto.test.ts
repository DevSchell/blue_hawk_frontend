import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_PHOTO_SIZE_BYTES,
  resolveProfileTab,
  VALID_PROFILE_TABS,
  validatePhotoFile,
} from '../views/pages/ProfilePage/profileUtils.ts'
import { AVATAR_PRESETS } from '../models/avatarPresets.ts'

test('Foto de Perfil - validação de arquivo para upload via validatePhotoFile', () => {
  // Arquivos que não são imagem
  const nonImages = [
    { type: 'application/pdf', size: 1024 },
    { type: 'text/plain', size: 512 },
    { type: 'video/mp4', size: 2048 },
    { type: '', size: 100 },
  ]

  for (const file of nonImages) {
    const res = validatePhotoFile(file)
    assert.strictEqual(res.valid, false)
    assert.strictEqual(res.error, 'Selecione um arquivo de imagem válido (PNG, JPG ou WebP).')
  }

  // Arquivo que excede o limite máximo
  const oversizedFile = { type: 'image/png', size: MAX_PHOTO_SIZE_BYTES + 1 }
  const overRes = validatePhotoFile(oversizedFile)
  assert.strictEqual(overRes.valid, false)
  assert.strictEqual(overRes.error, 'A imagem deve ter no máximo 3 MB.')

  // Imagens válidas
  const validPng = { type: 'image/png', size: 500 * 1024 }
  assert.deepStrictEqual(validatePhotoFile(validPng), { valid: true, error: null })

  const validJpg = { type: 'image/jpeg', size: 2 * 1024 * 1024 }
  assert.deepStrictEqual(validatePhotoFile(validJpg), { valid: true, error: null })

  const validWebp = { type: 'image/webp', size: 100 * 1024 }
  assert.deepStrictEqual(validatePhotoFile(validWebp), { valid: true, error: null })
})

test('Foto de Perfil - resolução de aba ativa via resolveProfileTab', () => {
  assert.strictEqual(resolveProfileTab(''), 'dados')
  assert.strictEqual(resolveProfileTab('?'), 'dados')
  assert.strictEqual(resolveProfileTab('?aba=dados'), 'dados')
  assert.strictEqual(resolveProfileTab('?aba=foto'), 'foto')
  assert.strictEqual(resolveProfileTab('?aba=atividades'), 'atividades')
  assert.strictEqual(resolveProfileTab('?aba=preferencias'), 'preferencias')

  // Parâmetros inválidos devem recair com segurança na aba padrão 'dados'
  assert.strictEqual(resolveProfileTab('?aba=inexistente'), 'dados')
  assert.strictEqual(resolveProfileTab('?outro=parametro'), 'dados')

  // Múltiplos parâmetros
  assert.strictEqual(resolveProfileTab('?sessao=demo&aba=foto&filtro=todos'), 'foto')
})

test('Foto de Perfil - lista de abas válidas contém todas as seções esperadas', () => {
  assert.deepStrictEqual([...VALID_PROFILE_TABS], ['dados', 'foto', 'atividades', 'preferencias', 'aparencia', 'senha', 'conta'])
})

test('Foto de Perfil - integridade dos presets temáticos do Blue Hawk', () => {
  assert.ok(AVATAR_PRESETS.length >= 6, 'A galeria deve conter ao menos 6 presets')

  const ids = new Set<string>()
  for (const preset of AVATAR_PRESETS) {
    assert.ok(preset.id.length > 0)
    assert.ok(preset.label.length > 0)
    assert.ok(!ids.has(preset.id), `ID duplicado de preset: ${preset.id}`)
    ids.add(preset.id)

    assert.ok(preset.dataUri.startsWith('data:image/svg+xml'))
    assert.ok(decodeURIComponent(preset.dataUri).includes('<svg'))
  }
})
