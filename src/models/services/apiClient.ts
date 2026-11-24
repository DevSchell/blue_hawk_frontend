import { clearSession, readToken, updateToken } from '../session'
import { renewRealtimeAuth } from '../realtime'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

/** URL completa de um caminho da API (ex.: a foto de capa, usada direto num <img>) */
export function apiUrl(path: string) {
  return `${API_BASE}${path}`
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Query = Record<string, string | number | undefined>

function headers(extra: Record<string, string> = {}, withToken = true) {
  const token = withToken ? readToken() : null
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

/** Guarda o token renovado pela API e repassa ao socket de tempo real, que vale só enquanto o token vale */
function rotateToken(token: string) {
  updateToken(token)
  renewRealtimeAuth()
}

/**
 * Lê o corpo da resposta. Rotas autenticadas vêm embrulhadas em { data, accessToken }
 * (ApiResponseAdvice), com um token novo que passa a valer; as públicas vêm cruas.
 */
async function readBody<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, `${label} falhou com ${response.status}`)
  }
  const text = await response.text()
  if (!text) return undefined as T
  const body: unknown = JSON.parse(text)
  if (body !== null && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    const wrapped = body as { data: T; accessToken?: unknown }
    if (typeof wrapped.accessToken === 'string') rotateToken(wrapped.accessToken)
    return wrapped.data
  }
  return body as T
}

/**
 * O token da API vale para uma única chamada (JwtRotationFilter troca a cada requisição,
 * inclusive nas que dão erro). Por isso as chamadas autenticadas rodam uma de cada vez,
 * sempre com o token mais recente, e não são abortadas no meio (perderiam o token novo).
 */
const PUBLIC_POSTS = ['/users', '/users/authenticate']
let queue: Promise<unknown> = Promise.resolve()

async function request<T>(method: string, path: string, label: string, payload?: unknown, signal?: AbortSignal) {
  const run = async (): Promise<T> => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    // Login e cadastro são públicos: um token velho faria a API recusar a chamada
    const authenticated = readToken() !== null && !(method === 'POST' && PUBLIC_POSTS.includes(path))
    // FormData (upload) vai cru: o navegador define o Content-Type com o boundary
    const isForm = payload instanceof FormData
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: headers(payload === undefined || isForm ? {} : { 'Content-Type': 'application/json' }, authenticated),
      body: payload === undefined ? undefined : isForm ? payload : JSON.stringify(payload),
      signal: authenticated ? undefined : signal,
    })
    // Em respostas de erro o token novo só vem no cabeçalho
    const rotated = response.headers.get('X-New-Token')
    if (rotated && authenticated) rotateToken(rotated)
    let retryAsVisitor = false
    const result = await readBody<T>(response, label).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401 && authenticated) {
        // Token recusado: a sessão acabou
        clearSession()
        window.dispatchEvent(new Event('bluehawk:session-expired'))
        // Leitura: repete como visitante; se a rota for pública, a página carrega em vez de mostrar erro
        if (method === 'GET') {
          retryAsVisitor = true
          return undefined as T
        }
      }
      throw error
    })
    if (retryAsVisitor) return run()
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return result
  }
  const next = queue.then(run, run)
  queue = next.catch(() => undefined)
  return next
}

export async function apiGet<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return request<T>('GET', `${path}${qs ? `?${qs}` : ''}`, `GET ${path}`, undefined, signal)
}

export function apiPost<T>(path: string, payload: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>('POST', path, `POST ${path}`, payload, signal)
}

export const apiPut = <T>(path: string, payload: unknown) => request<T>('PUT', path, `PUT ${path}`, payload)
export const apiPatch = <T>(path: string, payload: unknown) => request<T>('PATCH', path, `PATCH ${path}`, payload)
export const apiDelete = (path: string, signal?: AbortSignal) =>
  request<unknown>('DELETE', path, `DELETE ${path}`, undefined, signal)

/** DELETE que devolve um corpo (ex.: o jogo atualizado depois de remover a capa) */
export const apiDeleteJson = <T>(path: string, signal?: AbortSignal, payload?: unknown) =>
  request<T>('DELETE', path, `DELETE ${path}`, payload, signal)

/** POST multipart (upload de arquivo), pela mesma fila das chamadas autenticadas */
export const apiPostForm = <T>(path: string, form: FormData, signal?: AbortSignal) =>
  request<T>('POST', path, `POST ${path}`, form, signal)
