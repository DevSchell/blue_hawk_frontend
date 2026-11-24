/**
 * Tempo real (WebSocket): a API avisa quando chega mensagem, quando as notificações mudam e quando
 * uma partida muda. O polling dos hooks continua como reserva (mais espaçado enquanto o socket está de pé).
 *
 * Protocolo: conecta em {API}/ws, manda {type:"auth", token} (o token não vai na URL) e espera {type:"ready"}.
 */
import { readToken } from './session'

export type RealtimeChannel =
  | { kind: 'MATCH'; matchId: string; withUserId: string | null }
  | { kind: 'NEGOTIATION'; negotiationId: string }
  | { kind: 'DIRECT'; conversationId: string }

export type RealtimeEvent =
  | { type: 'chat.message'; channel: RealtimeChannel; message: { id: string; createdAt: string } & Record<string, unknown> }
  | { type: 'notifications.changed' }
  | { type: 'match.changed'; matchId: string }

type Listener = (event: RealtimeEvent) => void

const PING_MS = 25_000
const MAX_BACKOFF_MS = 30_000

const listeners = new Set<Listener>()
const statusListeners = new Set<() => void>()

let socket: WebSocket | null = null
let connected = false
let wanted = false
let attempts = 0
let retryTimer: number | undefined
let pingTimer: number | undefined

/** Endereço do socket a partir da base da API ("/api" em dev, pelo proxy do Vite, ou uma URL absoluta) */
export function realtimeUrl(apiBase: string, location: { protocol: string; host: string }): string {
  const base = apiBase.replace(/\/$/, '')
  if (/^https?:\/\//.test(base)) return `${base.replace(/^http/, 'ws')}/ws`
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${location.host}${base}/ws`
}

function setConnected(value: boolean) {
  if (connected === value) return
  connected = value
  statusListeners.forEach((notify) => notify())
}

function scheduleRetry() {
  if (!wanted) return
  window.clearTimeout(retryTimer)
  // 1 s, 2 s, 4 s… até 30 s, com um pouco de variação para várias abas não baterem juntas
  const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempts) * (0.8 + Math.random() * 0.4)
  attempts += 1
  retryTimer = window.setTimeout(open, delay)
}

function open() {
  const token = readToken()
  if (!wanted || !token || typeof WebSocket === 'undefined') return
  const apiBase = (import.meta.env.VITE_API_URL || '/api') as string
  let ws: WebSocket
  try {
    ws = new WebSocket(realtimeUrl(apiBase, window.location))
  } catch {
    scheduleRetry()
    return
  }
  socket = ws

  ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }))
  ws.onmessage = (raw) => {
    let event: { type?: string }
    try {
      event = JSON.parse(String(raw.data))
    } catch {
      return
    }
    if (event.type === 'ready') {
      attempts = 0
      setConnected(true)
      window.clearInterval(pingTimer)
      pingTimer = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
      }, PING_MS)
      return
    }
    if (event.type === 'pong') return
    listeners.forEach((listener) => listener(event as RealtimeEvent))
  }
  ws.onclose = (close) => {
    if (socket === ws) socket = null
    window.clearInterval(pingTimer)
    setConnected(false)
    // 4401: token recusado (sessão expirou); só tenta de novo se o token mudar (novo login)
    if (close.code === 4401) return
    scheduleRetry()
  }
  ws.onerror = () => ws.close()
}

/** Liga o tempo real (com sessão). Chamar de novo depois de um login troca a conexão. */
export function startRealtime() {
  stopRealtime()
  wanted = true
  attempts = 0
  open()
}

/** Desliga ao sair da conta */
export function stopRealtime() {
  wanted = false
  window.clearTimeout(retryTimer)
  window.clearInterval(pingTimer)
  const ws = socket
  socket = null
  if (ws && ws.readyState <= WebSocket.OPEN) ws.close(1000)
  setConnected(false)
}

/** Escuta os eventos; devolve a função que para de escutar */
export function onRealtime(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isRealtimeConnected() {
  return connected
}

export function subscribeRealtimeStatus(notify: () => void): () => void {
  statusListeners.add(notify)
  return () => statusListeners.delete(notify)
}

/** A mensagem é da conversa aberta? (mesa da partida: withUserId null) */
export function isSameChannel(a: RealtimeChannel, b: RealtimeChannel): boolean {
  if (a.kind === 'MATCH' && b.kind === 'MATCH') return a.matchId === b.matchId && (a.withUserId ?? null) === (b.withUserId ?? null)
  if (a.kind === 'NEGOTIATION' && b.kind === 'NEGOTIATION') return a.negotiationId === b.negotiationId
  if (a.kind === 'DIRECT' && b.kind === 'DIRECT') return a.conversationId === b.conversationId
  return false
}
