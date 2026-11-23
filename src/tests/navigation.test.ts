import test from 'node:test'
import assert from 'node:assert/strict'
import { ACCOUNT_ROUTES, currentNavItem, currentPath, NAV_ITEMS } from '../views/layout/navigation.ts'

test('Navegação - rotas de conta definidas', () => {
  assert.strictEqual(ACCOUNT_ROUTES.profile, '/perfil')
  assert.strictEqual(ACCOUNT_ROUTES.profilePhoto, '/perfil?aba=foto')
  assert.strictEqual(ACCOUNT_ROUTES.shelf, '/estante')
  assert.strictEqual(ACCOUNT_ROUTES.matches, '/partidas')
  assert.strictEqual(ACCOUNT_ROUTES.settings, '/configuracoes')
})

test('Navegação - normalização de caminho (currentPath)', () => {
  assert.strictEqual(currentPath('/'), '/')
  assert.strictEqual(currentPath('///'), '/')
  assert.strictEqual(currentPath('/perfil'), '/perfil')
  assert.strictEqual(currentPath('/perfil/'), '/perfil')
  assert.strictEqual(currentPath('/loja//'), '/loja')
})

test('Navegação - item ativo da navegação principal', () => {
  assert.deepStrictEqual(currentNavItem('/'), NAV_ITEMS[0]) // Wiki
  assert.deepStrictEqual(currentNavItem('/loja'), NAV_ITEMS[1]) // Loja
  assert.deepStrictEqual(currentNavItem('/estante'), NAV_ITEMS[2]) // Estante
  assert.strictEqual(currentNavItem('/perfil'), undefined) // Perfil não é item da barra superior principal
})
