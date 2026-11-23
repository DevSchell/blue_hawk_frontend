import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  clearSession,
  clearUserAvatar,
  getUserAvatar,
  getUserProfileExtras,
  readSession,
  readToken,
  readUserId,
  saveSession,
  saveUserAvatar,
  saveUserProfileExtras,
  updateStoredProfile,
  updateToken,
} from '../models/session.ts'

// Mock para localStorage e window com EventTarget real em ambiente Node
const storage = new Map<string, string>()
const eventTarget = new EventTarget()

const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
}

const windowMock = {
  localStorage: localStorageMock,
  dispatchEvent: (event: Event) => eventTarget.dispatchEvent(event),
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) =>
    eventTarget.addEventListener(type, listener),
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) =>
    eventTarget.removeEventListener(type, listener),
  location: { search: '', pathname: '/' },
}

// @ts-expect-error Mocking window global for Node test runner
globalThis.window = windowMock

beforeEach(() => {
  storage.clear()
})

test('Session - ciclo de vida completo de sessão (save, read, clear)', () => {
  assert.strictEqual(readSession(), null)
  assert.strictEqual(readToken(), null)

  const created = saveSession('leo@bluehawk.gg', 'token.abc.123')
  assert.strictEqual(created.name, 'leo')
  assert.strictEqual(created.email, 'leo@bluehawk.gg')

  const active = readSession()
  assert.deepStrictEqual(active, { name: 'leo', email: 'leo@bluehawk.gg' })
  assert.strictEqual(readToken(), 'token.abc.123')

  // Atualização de token rotacionado
  updateToken('token.rotacionado.456')
  assert.strictEqual(readToken(), 'token.rotacionado.456')

  // Atualização de perfil armazenado
  const updated = updateStoredProfile('Leonardo Schell', 'leo.schell@bluehawk.gg')
  assert.deepStrictEqual(updated, { name: 'Leonardo Schell', email: 'leo.schell@bluehawk.gg' })
  assert.deepStrictEqual(readSession(), { name: 'Leonardo Schell', email: 'leo.schell@bluehawk.gg' })

  // Encerramento de sessão
  clearSession()
  assert.strictEqual(readSession(), null)
  assert.strictEqual(readToken(), null)
})

test('Session - extração do ID de usuário (readUserId) a partir do payload JWT', () => {
  // 1. Sem token
  clearSession()
  assert.strictEqual(readUserId(), null)

  // 2. Token com JWT válido contendo sub
  const payloadBase64 = Buffer.from(JSON.stringify({ sub: 'user-guid-999', role: 'PLAYER' })).toString('base64url')
  const validJwt = `header.${payloadBase64}.signature`
  saveSession('player@bluehawk.gg', validJwt)

  assert.strictEqual(readUserId(), 'user-guid-999')

  // 3. Token com JWT sem sub
  const noSubPayload = Buffer.from(JSON.stringify({ role: 'ADMIN' })).toString('base64url')
  saveSession('admin@bluehawk.gg', `header.${noSubPayload}.signature`)
  assert.strictEqual(readUserId(), null)

  // 4. Token corrompido / não JWT
  saveSession('broken@bluehawk.gg', 'nao-e-um-jwt')
  assert.strictEqual(readUserId(), null)
})

test('Session - gerenciamento de avatar e disparo de evento (bluehawk:avatar-changed)', () => {
  const userId = 'usr-789'
  assert.strictEqual(getUserAvatar(userId), null)

  let capturedEvent: CustomEvent | null = null
  const onAvatarChanged = (e: Event) => {
    capturedEvent = e as CustomEvent
  }

  window.addEventListener('bluehawk:avatar-changed', onAvatarChanged)

  const fakeAvatarDataUri = 'data:image/svg+xml;utf8,<svg>test</svg>'
  saveUserAvatar(fakeAvatarDataUri, userId)

  assert.strictEqual(getUserAvatar(userId), fakeAvatarDataUri)
  assert.ok(capturedEvent !== null, 'O evento bluehawk:avatar-changed deve ser disparado')
  assert.strictEqual((capturedEvent as CustomEvent).detail.userId, userId)
  assert.strictEqual((capturedEvent as CustomEvent).detail.avatarUrl, fakeAvatarDataUri)

  // Limpeza de avatar
  capturedEvent = null
  clearUserAvatar(userId)
  assert.strictEqual(getUserAvatar(userId), null)
  assert.ok(capturedEvent !== null)
  assert.strictEqual((capturedEvent as CustomEvent).detail.avatarUrl, null)

  window.removeEventListener('bluehawk:avatar-changed', onAvatarChanged)
})

test('Session - persistência de dados estendidos e preferências do perfil', () => {
  const userId = 'usr-extras'
  assert.deepStrictEqual(getUserProfileExtras(userId), {})

  let eventFired = false
  const onExtrasChanged = () => {
    eventFired = true
  }
  window.addEventListener('bluehawk:profile-extras-changed', onExtrasChanged)

  saveUserProfileExtras(
    {
      bio: 'Amante de Catan e Terraforming Mars',
      city: 'Blumenau - SC',
      favoriteGenres: 'Estratégia, Eurogames',
      experienceLevel: 'Veterano',
      isPublic: true,
      showShelf: false,
      matchAlerts: true,
      offerAlerts: false,
    },
    userId
  )

  assert.strictEqual(eventFired, true)

  const saved = getUserProfileExtras(userId)
  assert.strictEqual(saved.bio, 'Amante de Catan e Terraforming Mars')
  assert.strictEqual(saved.city, 'Blumenau - SC')
  assert.strictEqual(saved.experienceLevel, 'Veterano')
  assert.strictEqual(saved.isPublic, true)
  assert.strictEqual(saved.showShelf, false)

  // Merge parcial de propriedades
  saveUserProfileExtras({ showShelf: true }, userId)
  const merged = getUserProfileExtras(userId)
  assert.strictEqual(merged.showShelf, true)
  assert.strictEqual(merged.city, 'Blumenau - SC')
  assert.strictEqual(merged.bio, 'Amante de Catan e Terraforming Mars')

  window.removeEventListener('bluehawk:profile-extras-changed', onExtrasChanged)
})
