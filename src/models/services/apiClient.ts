import { readToken, updateToken } from '../session'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Query = Record<string, string | number | undefined>

function headers(extra: Record<string, string> = {}) {
  const token = readToken()
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

/**
 * Lê o corpo da resposta. Rotas autenticadas vêm embrulhadas em { data, accessToken }
 * (ApiResponseAdvice), com um token novo que passa a valer; as públicas vêm cruas.
 */
async function readBody<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, `${label} falhou com ${response.status}`)
  }
  const body: unknown = await response.json()
  if (body !== null && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    const wrapped = body as { data: T; accessToken?: unknown }
    if (typeof wrapped.accessToken === 'string') updateToken(wrapped.accessToken)
    return wrapped.data
  }
  return body as T
}

export async function apiGet<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()

  const response = await fetch(`${API_BASE}${path}${qs ? `?${qs}` : ''}`, { headers: headers(), signal })
  return readBody<T>(response, `GET ${path}`)
}

export async function apiPost<T>(path: string, payload: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
    signal,
  })
  return readBody<T>(response, `POST ${path}`)
}
