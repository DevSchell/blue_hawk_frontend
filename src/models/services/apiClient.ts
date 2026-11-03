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

/**
 * GET na API. Respostas autenticadas podem vir embrulhadas em
 * { data, accessToken } (ApiResponseAdvice); as públicas vêm cruas.
 */
export async function apiGet<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()

  const response = await fetch(`${API_BASE}${path}${qs ? `?${qs}` : ''}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} falhou com ${response.status}`)
  }

  const body: unknown = await response.json()
  if (body !== null && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return (body as { data: T }).data
  }
  return body as T
}
