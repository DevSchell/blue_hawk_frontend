import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ACCOUNT_ROUTES,
  currentNavItem,
  currentPath,
  GAME_PATH_PREFIX,
  MATCH_PATH_PREFIX,
  matchPath,
  gamePath,
  idFromPath,
  NAV_ITEMS,
  requiresSignIn,
  STORE_OFFER_PATH_PREFIX,
  storeOfferPath,
  CATEGORY_PATH_PREFIX,
  categoryPath,
  STORE_CATEGORY_PATH_PREFIX,
  storeCategoryPath,
} from '../views/layout/navigation.ts'

test('Navegação - rotas de conta definidas', () => {
  assert.strictEqual(ACCOUNT_ROUTES.profile, '/perfil')
  assert.strictEqual(ACCOUNT_ROUTES.profilePhoto, '/perfil?aba=foto')
  assert.strictEqual(ACCOUNT_ROUTES.shelf, '/estante')
  assert.strictEqual(ACCOUNT_ROUTES.matches, '/partidas')
  assert.strictEqual(ACCOUNT_ROUTES.settings, '/perfil?aba=preferencias')
  assert.strictEqual(ACCOUNT_ROUTES.legacySettings, '/configuracoes')
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
  assert.deepStrictEqual(currentNavItem('/jogue'), NAV_ITEMS[2]) // Jogue
  assert.strictEqual(currentNavItem('/estante'), undefined) // Estante saiu da topbar: fica em "Meus Jogos"
  assert.strictEqual(currentNavItem('/perfil'), undefined) // Perfil não é item da barra superior principal
})

test('Navegação - páginas de jogo e de anúncio', () => {
  assert.strictEqual(gamePath('g1'), '/jogo/g1')
  assert.strictEqual(storeOfferPath('o1'), '/loja/anuncio/o1')
  assert.strictEqual(idFromPath(GAME_PATH_PREFIX, '/jogo/g1'), 'g1')
  assert.strictEqual(idFromPath(GAME_PATH_PREFIX, '/jogo/g1/'), 'g1')
  assert.strictEqual(idFromPath(GAME_PATH_PREFIX, '/jogo/'), null)
  assert.strictEqual(idFromPath(STORE_OFFER_PATH_PREFIX, '/loja'), null)
  assert.deepStrictEqual(currentNavItem('/jogo/g1'), NAV_ITEMS[0]) // Wiki
  assert.deepStrictEqual(currentNavItem('/loja/anuncio/o1'), NAV_ITEMS[1]) // Loja
})

test('Navegação - páginas de categoria na Wiki e na Loja', () => {
  assert.strictEqual(categoryPath('Estratégia'), '/categoria/Estrat%C3%A9gia')
  assert.strictEqual(storeCategoryPath('Party'), '/loja/categoria/Party')
  assert.strictEqual(idFromPath(CATEGORY_PATH_PREFIX, '/categoria/Estrat%C3%A9gia'), 'Estratégia')
  assert.strictEqual(idFromPath(STORE_CATEGORY_PATH_PREFIX, '/loja/categoria/Party'), 'Party')
  assert.deepStrictEqual(currentNavItem('/categoria/Cartas'), NAV_ITEMS[0])
  assert.deepStrictEqual(currentNavItem('/loja/categoria/Cartas'), NAV_ITEMS[1])
})

test('Partida - página própria, com a conversa certa e no item Jogue da topbar', () => {
  assert.strictEqual(matchPath('m 1'), '/jogue/partida/m%201')
  assert.strictEqual(matchPath('m1', 'mesa'), '/jogue/partida/m1?chat=mesa')
  assert.strictEqual(idFromPath(MATCH_PATH_PREFIX, '/jogue/partida/m%201'), 'm 1')
  assert.deepStrictEqual(currentNavItem('/jogue/partida/m1'), NAV_ITEMS[2])
})

test('Telas só para quem tem conta - visitante recebe a modal de login no lugar', () => {
  assert.ok(requiresSignIn('/estante'))
  assert.ok(requiresSignIn('/estante/'))
  assert.ok(requiresSignIn('/perfil?aba=foto'))
  assert.ok(requiresSignIn('/loja/anuncio/o1'))
  assert.ok(requiresSignIn('/aprovacoes'))
  // Vitrines públicas: navegam normalmente
  assert.ok(!requiresSignIn('/'))
  assert.ok(!requiresSignIn('/loja'))
  assert.ok(!requiresSignIn('/loja/categoria/Cartas'))
  assert.ok(!requiresSignIn('/jogue'))
  assert.ok(!requiresSignIn('/jogo/g1'))
  assert.ok(!requiresSignIn('/termos'))
})
