import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeProfilePatch,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  validateProfileData,
} from '../views/pages/ProfilePage/profileUtils.ts'

test('Perfil - validação de dados usando a função de produção (validateProfileData)', () => {
  // Nome vazio ou apenas espaços
  const emptyName = validateProfileData('', 'jogador@bluehawk.gg')
  assert.strictEqual(emptyName.valid, false)
  assert.strictEqual(emptyName.error, 'Informe o seu nome.')

  const whitespaceName = validateProfileData('     ', 'jogador@bluehawk.gg')
  assert.strictEqual(whitespaceName.valid, false)
  assert.strictEqual(whitespaceName.error, 'Informe o seu nome.')

  // Nome excedendo limite máximo
  const longName = 'A'.repeat(MAX_NAME_LENGTH + 1)
  const exceededName = validateProfileData(longName, 'jogador@bluehawk.gg')
  assert.strictEqual(exceededName.valid, false)
  assert.strictEqual(exceededName.error, `O nome pode ter até ${MAX_NAME_LENGTH} caracteres.`)

  // E-mails inválidos
  const invalidEmails = [
    '',
    'invalido',
    'usuario@',
    '@dominio.com',
    'usuario@dominio',
    'usuario @dominio.com',
    `a@b.${'c'.repeat(MAX_EMAIL_LENGTH)}`,
  ]

  for (const email of invalidEmails) {
    const res = validateProfileData('Leonardo', email)
    assert.strictEqual(res.valid, false, `E-mail "${email}" deveria ser considerado inválido`)
    assert.strictEqual(res.error, 'Informe um e-mail válido.')
  }

  // Dados válidos com sanitização de espaços (trim)
  const valid = validateProfileData('  Leonardo Schell  ', '  leonardo@bluehawk.gg  ')
  assert.strictEqual(valid.valid, true)
  assert.strictEqual(valid.error, null)
  assert.strictEqual(valid.cleanName, 'Leonardo Schell')
  assert.strictEqual(valid.cleanEmail, 'leonardo@bluehawk.gg')
})

test('Perfil - cálculo de patch para a API usando computeProfilePatch', () => {
  const current = { name: 'Leonardo', email: 'leonardo@bluehawk.gg' }

  // Nenhuma alteração real
  assert.deepStrictEqual(computeProfilePatch(current, { name: 'Leonardo', email: 'leonardo@bluehawk.gg' }), {})

  // Sem alteração mesmo com espaços excedentes no input
  assert.deepStrictEqual(
    computeProfilePatch(current, { name: '  Leonardo  ', email: '  leonardo@bluehawk.gg  ' }),
    {}
  )

  // Apenas alteração de nome
  assert.deepStrictEqual(
    computeProfilePatch(current, { name: 'Leonardo Schell', email: 'leonardo@bluehawk.gg' }),
    { name: 'Leonardo Schell' }
  )

  // Apenas alteração de e-mail
  assert.deepStrictEqual(
    computeProfilePatch(current, { name: 'Leonardo', email: 'novo@bluehawk.gg' }),
    { email: 'novo@bluehawk.gg' }
  )

  // Ambas as alterações
  assert.deepStrictEqual(
    computeProfilePatch(current, { name: 'Leonardo Schell', email: 'novo@bluehawk.gg' }),
    { name: 'Leonardo Schell', email: 'novo@bluehawk.gg' }
  )
})
